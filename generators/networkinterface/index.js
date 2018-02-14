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
        '\n\nWelcome to the Azure ARM Template project generator for Network interfaces!\n'
    );

    var currentGenerator = this;
    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of the network interface?',
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
      },
      {
        type: 'input',
        name: 'location',
        message: 'Where should the resource be created?',
        default: '[resourceGroup().location]'
      },
      {
        type: 'input',
        name: 'publicIpName',
        message:
          'What is the name of the public IP address resource to associate to this NIC? (blank for none)',
        validate: function(input) {
          var naming = new AzureNamingConventions.NamingConvention(
            input,
            AzureNamingConventions.NamingConventionRule.PublicIPAddress
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
        name: 'networkName',
        message:
          'What is the name of the virtual network address to assoicate to this NIC?',
        validate: function(input) {
          var naming = new AzureNamingConventions.NamingConvention(
            input,
            AzureNamingConventions.NamingConventionRule.VirtualNetworkVNet
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
        name: 'subnetName',
        message:
          'What is the name of the subnet in the virtual network to put this NIC in to?',
        validate: function(input) {
          var naming = new AzureNamingConventions.NamingConvention(
            input,
            AzureNamingConventions.NamingConventionRule.Subnet
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
        name: 'privateIpAddress',
        message: 'What private IP address should the NIC use? (blank for dynamic)'
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
      type: 'Microsoft.Network/networkInterfaces',
      name: properties.name,
      location: properties.location,
      dependsOn: [],
      properties: {
        ipConfigurations: [
          {
            name: 'ipconfig1',
            properties: {
              subnet: {
                id:
                  "[concat(resourceId('Microsoft.Network/virtualNetworks', '" +
                  properties.networkName +
                  "'), '/subnets/" +
                  properties.subnetName +
                  "')]"
              }
            }
          }
        ]
      }
    };

    if (properties.privateIpAddress === '') {
      newResource.properties.ipConfigurations[0].properties.privateIPAllocationMethod =
        'Dynamic';
    } else {
      newResource.properties.ipConfigurations[0].properties.privateIPAllocationMethod =
        'Static';
      newResource.properties.ipConfigurations[0].properties.privateIPAddress =
        properties.privateIpAddress;
    }
    if (properties.publicIpName !== '') {
      newResource.properties.ipConfigurations[0].properties.publicIPAddress = {
        id:
          "[resourceId('Microsoft.Network/publicIPAddresses', '" +
          properties.publicIpName +
          "')]"
      };
    }
    newResource = this._addDependencies(template, newResource, properties);
    template.resources.push(newResource);
    return template;
  }

  _addDependencies(template, resource, properties) {
    var networkName = properties.networkName;
    var foundResource = false;
    for (var i = 0; i < template.resources.length; i++) {
      var networkResource = template.resources[i];
      if (
        networkResource.name === networkName &&
        networkResource.type === 'Microsoft.Network/virtualNetworks'
      ) {
        foundResource = true;
        break;
      }
    }
    if (foundResource === true) {
      resource.dependsOn.push(
        "[resourceId('Microsoft.Network/virtualNetworks', '" + networkName + "')]"
      );
    }

    var publicIpName = properties.publicIpName;
    if (publicIpName !== '') {
      foundResource = false;
      for (var j = 0; j < template.resources.length; j++) {
        var ipResource = template.resources[j];
        if (
          ipResource.name === publicIpName &&
          ipResource.type === 'Microsoft.Network/publicIPAddresses'
        ) {
          foundResource = true;
          break;
        }
      }
      if (foundResource === true) {
        resource.dependsOn.push(
          "[resourceId('Microsoft.Network/publicIPAddresses', '" + publicIpName + "')]"
        );
      }
    }

    return resource;
  }
};
