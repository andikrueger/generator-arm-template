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
        '\n\nWelcome to the Azure ARM Template project generator for virtual networks!\n'
    );

    var currentGenerator = this;
    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of the network?',
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
        name: 'location',
        message: 'Where should the resource be created?',
        default: '[resourceGroup().location]'
      },
      {
        type: 'input',
        name: 'addressSpace',
        message: 'What address space should be used?',
        default: '192.168.0.0/16',
        validate: function(input) {
          if (input !== '') {
            var pattern = new RegExp(
              /((25[0-5]|2[0-4][0-9]|[1]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[1]?[0-9][0-9]?)\/([0-9]){1,2}/g
            );
            var result = pattern.test(input);
            if (result === false) {
              return false;
            }
            return true;
          }
          return false;
        }
      },
      {
        type: 'input',
        name: 'subnetName',
        message: 'What is the name of the default subnet?',
        default: 'Subnet-1'
      },
      {
        type: 'input',
        name: 'subnetAddressSpace',
        message: 'What is the address space of the default subnet?',
        default: '192.168.0.0/16'
      },
      {
        type: 'input',
        name: 'dnsServers',
        message:
          'What custom DNS servers should be used? (comma seperated list, blank for Azure DNS)'
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
      type: 'Microsoft.Network/virtualNetworks',
      name: properties.name,
      location: properties.location,
      properties: {
        addressSpace: {
          addressPrefixes: [properties.addressSpace]
        },
        dhcpOptions: {
          dnsServers: []
        },
        subnets: [
          {
            name: properties.subnetName,
            properties: {
              addressPrefix: properties.subnetAddressSpace
            }
          }
        ]
      },
      dependsOn: []
    };
    if (properties.dnsServers !== '') {
      var dnsServers = properties.dnsServers.split(',');
      newResource.properties.dhcpOptions.dnsServers = dnsServers;
    }
    template.resources.push(newResource);
    return template;
  }
};
