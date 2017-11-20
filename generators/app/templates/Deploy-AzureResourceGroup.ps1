#Requires -Version 3.0

Param(
    [string] [Parameter(Mandatory=$false)] $ResourceGroupLocation = '<%= region %>',
    [string] $ResourceGroupName = '<%= rgName %>',
    [switch] $UploadArtifacts,
    [string] $StorageAccountName,
    [string] $StorageContainerName = $ResourceGroupName.ToLowerInvariant() + '-stageartifacts',
    [string] $TemplateFile = 'azuredeploy.json',
    [string] $TemplateParametersFile = 'azuredeploy.parameters.json',
    [string] $ArtifactStagingDirectory = '.',
    [string] $DSCSourceFolder = 'DSC',
    [switch] $ValidateOnly
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 3

$azCtx = Get-AzureRmContext
if ($null -eq $azCtx.Account)
{
    try
    {
        Write-Verbose -Message "Prompting for Azure Resource Manager credentials"
        Add-AzureRmAccount
        if ($? -eq $false)
        {
            throw $Error
        }
        else
        {
            $loginSucceeded = $true
        }
    }
    catch
    {
        $Error
        if ($Error[2] -like "*User canceled authentication*")
        {
            throw "User canceled authentication"
        }
        else
        {
            throw "No credentials were provided, or another error occurred logging on to Azure."
        }
    }

    if ($loginSucceeded)
    {
        [array]$subscriptions = Get-AzureRmSubscription -WarningAction SilentlyContinue
        # Prompt for a subscription in case we have more than one
        if ($subscriptions.Count -gt 1)
        {
            Write-Verbose -Message "Prompting for subscription..."
            $subscriptionDetails = @(Get-AzureRmSubscription -WarningAction SilentlyContinue `
                                    | Out-GridView -Title "Select ONE subscription..." -PassThru)
    
            if ($null -eq $subscriptionDetails)
            {
                throw " - A subscription must be selected."
            }
            elseif ($subscriptionDetails.Count -gt 1)
            {
                throw " - Please select *only one* subscription."
            }
            Select-AzureRmSubscription -SubscriptionName $subscriptionDetails[0].Name
        }
    }
}

function Format-ValidationOutput 
{
    param (
        $ValidationOutput, 
        
        [int] 
        $Depth = 0
    )
    Set-StrictMode -Off
    return @($ValidationOutput | Where-Object -FilterScript { 
        $_ -ne $null 
    } | ForEach-Object -Process { 
        @('  ' * $Depth + ': ' + $_.Message) + @(Format-ValidationOutput @($_.Details) ($Depth + 1)) 
    })
}

$OptionalParameters = New-Object -TypeName Hashtable
$TemplateFile = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($PSScriptRoot, $TemplateFile))
$TemplateParametersFile = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($PSScriptRoot, $TemplateParametersFile))

if ($UploadArtifacts) 
{
    # Convert relative paths to absolute paths if needed
    $ArtifactStagingDirectory = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($PSScriptRoot, $ArtifactStagingDirectory))
    $DSCSourceFolder = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($PSScriptRoot, $DSCSourceFolder))

    # Parse the parameter file and update the values of artifacts location and artifacts location SAS token if they are present
    $JsonParameters = Get-Content -Path $TemplateParametersFile -Raw | ConvertFrom-Json

    if (($JsonParameters | Get-Member -Type NoteProperty 'parameters') -ne $null)
    {
        $JsonParameters = $JsonParameters.parameters
    }

    $ArtifactsLocationName = '_artifactsLocation'
    $ArtifactsLocationSasTokenName = '_artifactsLocationSasToken'
    $OptionalParameters[$ArtifactsLocationName] = $JsonParameters `
        | Select-Object -Expand $ArtifactsLocationName -ErrorAction Ignore `
        | Select-Object -Expand 'value' -ErrorAction Ignore
    $OptionalParameters[$ArtifactsLocationSasTokenName] = $JsonParameters `
        | Select-Object -Expand $ArtifactsLocationSasTokenName -ErrorAction Ignore `
        | Select-Object -Expand 'value' -ErrorAction Ignore

    # Create DSC configuration archive
    if (Test-Path $DSCSourceFolder) 
    {
        $DSCSourceFilePaths = @(Get-ChildItem $DSCSourceFolder -File -Filter '*.ps1' `
            | ForEach-Object -Process {
                $_.FullName
            })
        
        foreach ($DSCSourceFilePath in $DSCSourceFilePaths) 
        {
            $DSCArchiveFilePath = $DSCSourceFilePath.Substring(0, $DSCSourceFilePath.Length - 4) + '.zip'
            Publish-AzureRmVMDscConfiguration -ConfigurationPath $DSCSourceFilePath `
                                              -OutputArchivePath $DSCArchiveFilePath `
                                              -Force `
                                              -Verbose
        }
    }

    # Create a storage account name if none was provided
    if ($StorageAccountName -eq '') 
    {
        $StorageAccountName = 'stage' + ((Get-AzureRmContext).Subscription.SubscriptionId).Replace('-', '').substring(0, 19)
    }

    $StorageAccount = (Get-AzureRmStorageAccount | Where-Object -FilterScript {
        $_.StorageAccountName -eq $StorageAccountName
    })

    # Create the storage account if it doesn't already exist
    if ($StorageAccount -eq $null) 
    {
        $StorageResourceGroupName = 'ARM_Deploy_Staging'
        New-AzureRmResourceGroup -Location "$ResourceGroupLocation" `
                                 -Name $StorageResourceGroupName `
                                 -Force
        $StorageAccount = New-AzureRmStorageAccount -StorageAccountName $StorageAccountName `
                                                    -Type 'Standard_LRS' `
                                                    -ResourceGroupName $StorageResourceGroupName `
                                                    -Location "$ResourceGroupLocation"
    }

    # Generate the value for artifacts location if it is not provided in the parameter file
    if ($OptionalParameters[$ArtifactsLocationName] -eq $null) 
    {
        $OptionalParameters[$ArtifactsLocationName] = $StorageAccount.Context.BlobEndPoint + $StorageContainerName
    }

    # Copy files from the local storage staging location to the storage account container
    New-AzureStorageContainer -Name $StorageContainerName `
                              -Context $StorageAccount.Context `
                              -ErrorAction SilentlyContinue *>&1

    $ArtifactFilePaths = Get-ChildItem -Path $ArtifactStagingDirectory `
                                       -Recurse `
                                       -File | ForEach-Object -Process {
                                           $_.FullName
                                        }
    foreach ($SourcePath in $ArtifactFilePaths) 
    {
        Set-AzureStorageBlobContent -File $SourcePath `
                                    -Blob $SourcePath.Substring($ArtifactStagingDirectory.length + 1) `
                                    -Container $StorageContainerName `
                                    -Context $StorageAccount.Context `
                                    -Force
    }

    # Generate a 4 hour SAS token for the artifacts location if one was not provided in the parameters file
    if ($OptionalParameters[$ArtifactsLocationSasTokenName] -eq $null) 
    {
        $sasToken = New-AzureStorageContainerSASToken -Container $StorageContainerName `
                                                      -Context $StorageAccount.Context `
                                                      -Permission r `
                                                      -ExpiryTime (Get-Date).AddHours(4)
        $OptionalParameters[$ArtifactsLocationSasTokenName] = ConvertTo-SecureString -String $sasToken -AsPlainText -Force
    }
}

# Create or update the resource group using the specified template file and template parameters file
New-AzureRmResourceGroup -Name $ResourceGroupName `
                         -Location $ResourceGroupLocation `
                         -Verbose `
                         -Force

if ($ValidateOnly) 
{
    $ErrorMessages = Format-ValidationOutput (Test-AzureRmResourceGroupDeployment -ResourceGroupName $ResourceGroupName `
                                                                                  -TemplateFile $TemplateFile `
                                                                                  -TemplateParameterFile $TemplateParametersFile `
                                                                                  @OptionalParameters)
    if ($ErrorMessages) 
    {
        Write-Output '', 'Validation returned the following errors:', @($ErrorMessages), '', 'Template is invalid.'
    }
    else 
    {
        Write-Output '', 'Template is valid.'
    }
}
else 
{
    New-AzureRmResourceGroupDeployment -Name ((Get-ChildItem $TemplateFile).BaseName + '-' + ((Get-Date).ToUniversalTime()).ToString('MMdd-HHmm')) `
                                       -ResourceGroupName $ResourceGroupName `
                                       -TemplateFile $TemplateFile `
                                       -TemplateParameterFile $TemplateParametersFile `
                                       @OptionalParameters `
                                       -Force -Verbose `
                                       -ErrorVariable ErrorMessages
    if ($ErrorMessages) 
    {
        Write-Output '', 'Template deployment returned the following errors:', @(@($ErrorMessages) | ForEach-Object -Process { 
            $_.Exception.Message.TrimEnd("`r`n") 
        })
    }
}
