'use strict';
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

    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of the network interface?',
        validate: function(input) {
          if (input !== '') {
            return true;
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
          'What is the name of the public IP address resource to associate to this NIC? (blank for none)'
      },
      {
        type: 'input',
        name: 'networkName',
        message:
          'What is the name of the virtual network address to assoicate to this NIC?',
        validate: function(input) {
          if (input !== '') {
            return true;
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
          if (input !== '') {
            return true;
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
    template.resources.push(newResource);
    return template;
  }
};
