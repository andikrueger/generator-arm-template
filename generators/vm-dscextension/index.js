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
        '\n\nWelcome to the Azure ARM Template project generator for DSC VM Extension!\n'
    );

    const prompts = [
      {
        type: 'input',
        name: 'vmName',
        message: 'What is the name of the VM?'
      },
      {
        type: 'input',
        name: 'location',
        message: 'Where should the resource be created?',
        default: '[resourceGroup().location]'
      },
      {
        type: 'input',
        name: 'modulesUrl',
        message: 'What is the URL of the configuration zip file?'
      },
      {
        type: 'input',
        name: 'configurationFunction',
        message: 'What script/function should be called for the configuration?'
      },
      {
        type: 'input',
        name: 'sasToken',
        message: 'What SAS token is needed to access the configuration zip file'
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
      type: 'Microsoft.Compute/virtualMachines/extensions',
      name: properties.vmName + '/Microsoft.Powershell.DSC',
      apiVersion: '2015-05-01-preview',
      location: properties.location,
      dependsOn: [
        "[resourceId('Microsoft.Compute/virtualMachines', '" + properties.vmName + "')]"
      ],
      properties: {
        publisher: 'Microsoft.Powershell',
        type: 'DSC',
        typeHandlerVersion: '2.20',
        autoUpgradeMinorVersion: true,
        settings: {
          ModulesUrl: properties.modulesUrl,
          ConfigurationFunction: properties.configurationFunction,
          SasToken: properties.sasToken,
          Properties: {}
        },
        protectedSettings: {
          Items: {}
        }
      }
    };
    newResource = this._addDependencies(template, newResource, properties);
    template.resources.push(newResource);
    return template;
  }

  _addDependencies(template, resource, properties) {
    var vmName = properties.vmName;
    var foundResource = false;
    for (var i = 0; i < template.resources.length; i++) {
      var networkResource = template.resources[i];
      if (
        networkResource.name === vmName &&
        networkResource.type === 'Microsoft.Compute/virtualMachines'
      ) {
        foundResource = true;
        break;
      }
    }
    if (foundResource === true) {
      resource.dependsOn.push(
        "[resourceId('Microsoft.Compute/virtualMachines', '" + vmName + "')]"
      );
    }

    return resource;
  }
};
