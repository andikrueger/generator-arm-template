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
        '\n\nWelcome to the Azure ARM Template project generator!\n'
    );

    var currentGenerator = this;
    const prompts = [
      {
        type: 'input',
        name: 'rgName',
        message: 'What resource group name would you like to use?',
        store: true,
        validate: function(input) {
          var naming = new AzureNamingConventions.NamingConvention(
            input,
            AzureNamingConventions.NamingConventionRule.ResourceGroup
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
        type: 'list',
        name: 'region',
        message: 'What Azure region would you like to deploy to?',
        store: true,
        choices: [
          {
            name: 'Australia East',
            value: 'australiaeast'
          },
          {
            name: 'Australia Southeast',
            value: 'australiasoutheast'
          },
          {
            name: 'Brazil South',
            value: 'brazilsouth'
          },
          {
            name: 'Canada Central',
            value: 'canadacentral'
          },
          {
            name: 'Canada East',
            value: 'canadaeast'
          },
          {
            name: 'Central India',
            value: 'centralindia'
          },
          {
            name: 'Central US',
            value: 'centralus'
          },
          {
            name: 'East Asia',
            value: 'eastasia'
          },
          {
            name: 'East US',
            value: 'eastus'
          },
          {
            name: 'East US 2',
            value: 'eastus2'
          },
          {
            name: 'Japan East',
            value: 'japaneast'
          },
          {
            name: 'Japan West',
            value: 'japanwest'
          },
          {
            name: 'Korea Central',
            value: 'koreacentral'
          },
          {
            name: 'Korea South',
            value: 'koreasouth'
          },
          {
            name: 'North Central US',
            value: 'northcentralus'
          },
          {
            name: 'North Europe',
            value: 'northeurope'
          },
          {
            name: 'South Central US',
            value: 'southcentralus'
          },
          {
            name: 'South India',
            value: 'southindia'
          },
          {
            name: 'Southeast Asia',
            value: 'southeastasia'
          },
          {
            name: 'UK South',
            value: 'uksouth'
          },
          {
            name: 'UK West',
            value: 'ukwest'
          },
          {
            name: 'West Central US',
            value: 'westcentralus'
          },
          {
            name: 'West Europe',
            value: 'westeurope'
          },
          {
            name: 'West India',
            value: 'westindia'
          },
          {
            name: 'West US',
            value: 'westus'
          },
          {
            name: 'West US 2',
            value: 'westus2'
          }
        ]
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    this.fs.copyTpl(
      this.templatePath('Deploy-AzureResourceGroup.ps1'),
      this.destinationPath('Deploy-AzureResourceGroup.ps1'),
      {
        rgName: this.props.rgName,
        region: this.props.region
      }
    );
    this.fs.copy(
      this.templatePath('azuredeploy.json'),
      this.destinationPath('azuredeploy.json')
    );
    this.fs.copy(
      this.templatePath('azuredeploy.parameters.json'),
      this.destinationPath('azuredeploy.parameters.json')
    );
    this.fs.copy(
      this.templatePath('.vscode/launch.json'),
      this.destinationPath('.vscode/launch.json')
    );
  }
};
