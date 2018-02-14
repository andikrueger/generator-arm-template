'use strict';
const AzureNamingConventions = require('azure-naming-conventions');
const Generator = require('yeoman-generator');
const chalk = require('chalk');

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      chalk.blue('                          A                       \n') +
        chalk.blue('                       AAAA                       \n') +
        chalk.blue('                     AAAAAA AAA                   \n') +
        chalk.blue('                  AAAAAAA  AAAAA                  \n') +
        chalk.blue('                AAAAAAAA  AAAAAAA                 \n') +
        chalk.blue('              AAAAAAAAA  AAAAAAAAA                \n') +
        chalk.blue('            AAAAAAAAAA  AAAAAAAAAAA               \n') +
        chalk.blue('           AAAAAAAAAA  AAAAAAAAAAAAAA             \n') +
        chalk.blue('          AAAAAAAAAA  AAAAAAAAAAAAAAAA            \n') +
        chalk.blue('         AAAAAAAAAA   AAAAAAAAAAAAAAAAA           \n') +
        chalk.blue('        AAAAAAAAAA      AAAAAAAAAAAAAAAA          \n') +
        chalk.blue('      AAAAAAAAAAA         AAAAAAAAAAAAAAA         \n') +
        chalk.blue('     AAAAAAAAAAA            AAAAAAAAAAAAAA        \n') +
        chalk.blue('    AAAAAAAAAAA               AAAAAAAAAAAAAA      \n') +
        chalk.blue('   AAAAAAAAAAA                 AAAAAAAAAAAAAA     \n') +
        chalk.blue('   AAAAAAAAAA                 AAAAAAAAAAAAAAAA    \n') +
        chalk.blue('                  AAAAAAAAAAAAAAAAAAAAAAAAAAAAA   \n') +
        chalk.blue('               AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA   \n') +
        '\n\nWelcome to the Azure ARM Template project generator for virtual machines!\n'
    );

    var currentGenerator = this;
    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of the VM?',
        validate: function(input) {
          var naming = new AzureNamingConventions.NamingConvention(
            input,
            AzureNamingConventions.NamingConventionRule.VirtualMachineWindows
          );
          var namingResult = naming.validate();
          if (input !== '' && namingResult.isValid) {
            return true;
          }
          if (input === '') {
            currentGenerator.log('\n Please enter a valid string.');
          }
          if (!namingResult.isValid) {
            currentGenerator.log(
              '\n Please make sure to fulfill the following Azure Naming Convention Rules: ' +
                namingResult.toString()
            );
          }
          return false;
        }
      },
      {
        type: 'input',
        name: 'location',
        message: 'Where should the resource be created?',
        default: '[resourceGroup().location]'
      },
      {
        type: 'input',
        name: 'size',
        message: 'What size should the VM be?'
      },
      {
        type: 'input',
        name: 'username',
        message: 'What is the username of the local admin account?',
        validate: function(input) {
          if (input !== '') {
            return true;
          }
          return false;
        }
      },
      {
        type: 'input',
        name: 'password',
        message: 'What is the password of the local admin account?',
        validate: function(input) {
          if (input !== '') {
            return true;
          }
          return false;
        }
      },
      {
        type: 'input',
        name: 'publisher',
        message: 'Who is the publisher of the image for the VM?',
        default: 'MicrosoftWindowsServer'
      },
      {
        type: 'input',
        name: 'offer',
        message: 'What VM image offer should be used?',
        default: 'WindowsServer'
      },
      {
        type: 'input',
        name: 'sku',
        message: 'What image SKU should be used?',
        default: '2016-Datacenter'
      },
      {
        type: 'input',
        name: 'version',
        message: 'What image version should be used?',
        default: 'latest'
      },
      {
        type: 'input',
        name: 'storageAccount',
        message: 'What storage account should be used for the default disk?',
        validate: function(input) {
          var naming = new AzureNamingConventions.NamingConvention(
            input,
            AzureNamingConventions.NamingConventionRule.StorageAccountNameDisks
          );
          var namingResult = naming.validate();
          if (input !== '' && namingResult.isValid) {
            return true;
          }
          if (input === '') {
            currentGenerator.log('\n Please enter a valid string.');
          }
          if (!namingResult.isValid) {
            currentGenerator.log(
              '\n Please make sure to fulfill the following Azure Naming Convention Rules: ' +
                namingResult.toString()
            );
          }
          return false;
        }
      },
      {
        type: 'input',
        name: 'nic',
        message: 'What is the name of the NIC that should be used?',
        validate: function(input) {
          var naming = new AzureNamingConventions.NamingConvention(
            input,
            AzureNamingConventions.NamingConventionRule.NetworkInterface
          );
          var namingResult = naming.validate();
          if (input !== '' && namingResult.isValid) {
            return true;
          }
          if (input === '') {
            currentGenerator.log('\n Please enter a valid string.');
          }
          if (!namingResult.isValid) {
            currentGenerator.log(
              '\n Please make sure to fulfill the following Azure Naming Convention Rules: ' +
                namingResult.toString()
            );
          }
          return false;
        }
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    var templatePath = this.destinationPath('azuredeploy.json');
    var template = this.fs.readJSON(templatePath);
    template = this._addResource(template, this.props);
    this.fs.writeJSON(templatePath, template, null, 2);
  }

  _addResource(template, properties) {
    var newResource = {
      apiVersion: '2015-05-01-preview',
      type: 'Microsoft.Compute/virtualMachines',
      name: properties.name,
      location: properties.location,
      dependsOn: [],
      properties: {
        hardwareProfile: {
          vmSize: properties.size
        },
        osProfile: {
          computerName: properties.name,
          adminUsername: properties.username,
          adminPassword: properties.password,
          windowsConfiguration: {
            provisionVMAgent: true,
            enableAutomaticUpdates: true
          }
        },
        storageProfile: {
          imageReference: {
            publisher: properties.publisher,
            offer: properties.offer,
            sku: properties.sku,
            version: properties.version
          },
          osDisk: {
            name: properties.name + '-disk',
            caching: 'ReadWrite',
            createOption: 'FromImage',
            vhd: {
              uri:
                'https://' +
                properties.storageAccount +
                '.blob.core.windows.net/vhds/' +
                properties.name +
                '-disk.vhd'
            }
          }
        },
        networkProfile: {
          networkInterfaces: [
            {
              id:
                "[resourceId('Microsoft.Network/networkInterfaces','" +
                properties.nic +
                "')]"
            }
          ]
        }
      }
    };
    newResource = this._addDependencies(template, newResource, properties);
    template.resources.push(newResource);
    return template;
  }

  _addDependencies(template, resource, properties) {
    var nicName = properties.nic;
    var foundResource = false;
    for (var i = 0; i < template.resources.length; i++) {
      var networkResource = template.resources[i];
      if (
        networkResource.name === nicName &&
        networkResource.type === 'Microsoft.Network/networkInterfaces'
      ) {
        foundResource = true;
        break;
      }
    }
    if (foundResource === true) {
      resource.dependsOn.push(
        "[resourceId('Microsoft.Network/networkInterfaces', '" + nicName + "')]"
      );
    }

    var storageName = properties.storageAccount;
    foundResource = false;
    for (var j = 0; j < template.resources.length; j++) {
      var storageResource = template.resources[j];
      if (
        storageResource.name === storageName &&
        storageResource.type === 'Microsoft.Storage/storageAccounts'
      ) {
        foundResource = true;
        break;
      }
    }
    if (foundResource === true) {
      resource.dependsOn.push(
        "[resourceId('Microsoft.Storage/storageAccounts', '" + storageName + "')]"
      );
    }

    return resource;
  }
};
