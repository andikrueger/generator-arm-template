#Requires -Version 3.0
Param(
    [Parameter(Mandatory = $false)]
    [string]
    $ResourceGroupLocation = '<%= region %>',
    
    [Parameter(Mandatory = $false)]
    [string]
    $ResourceGroupName = '<%= rgName %>',

    [Parameter(Mandatory = $false)]
    [string]
    $TemplateFile = 'azuredeploy.json',
    
    [Parameter(Mandatory = $false)]
    [string]
    $TemplateParametersFile = 'azuredeploy.parameters.json',
    
    [Parameter(Mandatory = $false)]
    [switch]
    $ValidateOnly
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
