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
        '\n\nWelcome to the Azure ARM Template project generator!\n'
    );

    const prompts = [
      {
        type: 'input',
        name: 'rgName',
        message: 'What resource group name would you like to use?',
        store: true
      },
      {
        type: 'list',
        name: 'region',
        message: 'What Azure region would you like to deploy to?',
        store: true,
        choices: [
          {
            value: 'eastasia',
            name: 'East Asia'
          },
          {
            value: 'southeastasia',
            name: 'Southeast Asia'
          },
          {
            value: 'centralus',
            name: 'Central US'
          },
          {
            value: 'eastus',
            name: 'East US'
          },
          {
            value: 'eastus2',
            name: 'East US 2'
          },
          {
            value: 'westus',
            name: 'West US'
          },
          {
            value: 'northcentralus',
            name: 'North Central US'
          },
          {
            value: 'southcentralus',
            name: 'South Central US'
          },
          {
            value: 'northeurope',
            name: 'North Europe'
          },
          {
            value: 'westeurope',
            name: 'West Europe'
          },
          {
            value: 'japanwest',
            name: 'Japan West'
          },
          {
            value: 'japaneast',
            name: 'Japan East'
          },
          {
            value: 'brazilsouth',
            name: 'Brazil South'
          },
          {
            value: 'australiaeast',
            name: 'Australia East'
          },
          {
            value: 'australiasoutheast',
            name: 'Australia Southeast'
          },
          {
            value: 'southindia',
            name: 'South India'
          },
          {
            value: 'centralindia',
            name: 'Central India'
          },
          {
            value: 'westindia',
            name: 'West India'
          },
          {
            value: 'canadacentral',
            name: 'Canada Central'
          },
          {
            value: 'canadaeast',
            name: 'Canada East'
          },
          {
            value: 'uksouth',
            name: 'UK South'
          },
          {
            value: 'ukwest',
            name: 'UK West'
          },
          {
            value: 'westcentralus',
            name: 'West Central US'
          },
          {
            value: 'westus2',
            name: 'West US 2'
          },
          {
            value: 'koreacentral',
            name: 'Korea Central'
          },
          {
            value: 'koreasouth',
            name: 'Korea South'
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
