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
        '\n\nWelcome to the Azure ARM Template project generator for web app hosting plan!\n'
    );

    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of the hosting plan?',
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
        type: 'list',
        name: 'tier',
        message: 'What tier will this plan run?',
        choices: ['Premium', 'Standard', 'Basic', 'Shared', 'Free']
      },
      {
        type: 'list',
        name: 'tierSize',
        message: 'What size tier should be used?',
        choices: ['1', '2', '3'],
        when: function(answers) {
          if (answers.tier === 'Free' || answers.tier === 'Shared') {
            return false;
          }
          return true;
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
      type: 'Microsoft.Web/serverfarms',
      sku: {
        tier: properties.tier
      },
      kind: 'app',
      name: properties.name,
      apiVersion: '2016-09-01',
      location: properties.location,
      scale: null,
      properties: {
        name: properties.name,
        perSiteScaling: false,
        reserved: false,
        targetWorkerCount: 0,
        targetWorkerSizeId: 0
      },
      dependsOn: []
    };

    switch (properties.tier) {
      case 'Premium':
        newResource.sku.name = 'P' + properties.tierSize;
        newResource.sku.size = 'P' + properties.tierSize;
        newResource.sku.family = 'P';
        newResource.sku.capacity = 1;
        break;
      case 'Standard':
        newResource.sku.name = 'S' + properties.tierSize;
        newResource.sku.size = 'S' + properties.tierSize;
        newResource.sku.family = 'S';
        newResource.sku.capacity = 1;
        break;
      case 'Basic':
        newResource.sku.name = 'B' + properties.tierSize;
        newResource.sku.size = 'B' + properties.tierSize;
        newResource.sku.family = 'B';
        newResource.sku.capacity = 1;
        break;
      case 'Shared':
        newResource.sku.name = 'D1';
        newResource.sku.size = 'D1';
        newResource.sku.family = 'D';
        newResource.sku.capacity = 0;
        break;
      case 'Free':
        newResource.sku.name = 'F1';
        newResource.sku.size = 'F1';
        newResource.sku.family = 'F';
        newResource.sku.capacity = 0;
        break;
      default:
        throw new Error('Unknown tier "' + properties.tier + '"');
    }

    template.resources.push(newResource);
    return template;
  }
};
