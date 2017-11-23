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
        '\n\nWelcome to the Azure ARM Template project generator for SQL Database!\n'
    );

    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of the database?',
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
        name: 'serverName',
        message: 'What is the name of the logical server this runs on?',
        validate: function(input) {
          if (input !== '') {
            return true;
          }
          return false;
        }
      },
      {
        type: 'input',
        name: 'collation',
        message: 'What collation should this database use?',
        default: 'SQL_Latin1_General_CP1_CI_AS'
      },
      {
        type: 'list',
        name: 'edition',
        message: 'What plan should this database run at?',
        choices: ['Basic', 'Standard', 'Premium']
      },
      {
        type: 'list',
        name: 'standardTier',
        message: 'What scale should this database run at?',
        choices: ['S0', 'S1', 'S2', 'S3'],
        when: function(answers) {
          if (answers.edition === 'Standard') {
            return true;
          }
          return false;
        }
      },
      {
        type: 'list',
        name: 'premiumTier',
        message: 'What scale should this database run at?',
        choices: ['P1', 'P2', 'P4', 'P6', 'P11', 'P15'],
        when: function(answers) {
          if (answers.edition === 'Premium') {
            return true;
          }
          return false;
        }
      },
      {
        type: 'list',
        name: 'basicStorage',
        message: 'How much storage should be allocated to this database?',
        choices: ['100MB', '500MB', '1GB', '2GB'],
        when: function(answers) {
          if (answers.edition === 'Basic') {
            return true;
          }
          return false;
        }
      },
      {
        type: 'list',
        name: 'standardStorage',
        message: 'How much storage should be allocated to this database?',
        choices: [
          '100MB',
          '500MB',
          '1GB',
          '2GB',
          '5GB',
          '10GB',
          '20GB',
          '30GB',
          '40GB',
          '50GB',
          '100GB',
          '150GB',
          '200GB',
          '250GB'
        ],
        when: function(answers) {
          if (answers.edition === 'Standard') {
            return true;
          }
          return false;
        }
      },
      {
        type: 'list',
        name: 'premiumStorage',
        message: 'How much storage should be allocated to this database?',
        choices: [
          '100MB',
          '500MB',
          '1GB',
          '2GB',
          '5GB',
          '10GB',
          '20GB',
          '30GB',
          '40GB',
          '50GB',
          '100GB',
          '150GB',
          '200GB',
          '250GB',
          '300GB',
          '400GB',
          '500GB'
        ],
        when: function(answers) {
          if (answers.edition === 'Premium') {
            return true;
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
      type: 'Microsoft.Sql/servers/databases',
      name: properties.serverName + '/' + properties.name,
      apiVersion: '2014-04-01-preview',
      location: properties.location,
      properties: {
        edition: properties.edition,
        collation: properties.collation
      },
      dependsOn: []
    };

    var dbSize;
    switch (properties.edition) {
      case 'Basic':
        newResource.properties.requestedServiceObjectiveName = 'Basic';
        dbSize = properties.basicStorage;
        break;
      case 'Standard':
        newResource.properties.requestedServiceObjectiveName = properties.standardTier;
        dbSize = properties.standardStorage;
        break;
      case 'Premium':
        newResource.properties.requestedServiceObjectiveName = properties.premiumTier;
        dbSize = properties.premiumStorage;
        break;
      default:
        throw new Error('Unknown edition "' + properties.edition + '"');
    }

    newResource.properties.maxSizeBytes = this._getSizeInBytes(dbSize);
    newResource = this._addDependencies(template, newResource, properties);
    template.resources.push(newResource);
    return template;
  }

  _getSizeInBytes(size) {
    switch (size) {
      case '100MB':
        return '104857600';
      case '200MB':
        return '209715200';
      case '1GB':
        return '1073741824';
      case '2GB':
        return '2147483648';
      case '5GB':
        return '5368709120';
      case '10GB':
        return '10737418240';
      case '20GB':
        return '21474836480';
      case '30GB':
        return '32212254720';
      case '40GB':
        return '42949672960';
      case '50GB':
        return '53687091200';
      case '100GB':
        return '107374182400';
      case '150GB':
        return '161061273600';
      case '200GB':
        return '214748364800';
      case '250GB':
        return '268435456000';
      case '300GB':
        return '322122547200';
      case '400GB':
        return '429496729600';
      case '500GB':
        return '536870912000';
      default:
        throw new Error('Unknown storage ammount "' + size + '"');
    }
  }

  _addDependencies(template, resource, properties) {
    var serverName = properties.serverName;
    var foundResource = false;
    for (var i = 0; i < template.resources.length; i++) {
      var resourceToCheck = template.resources[i];
      if (
        resourceToCheck.name === serverName &&
        resourceToCheck.type === 'Microsoft.Sql/servers'
      ) {
        foundResource = true;
        break;
      }
    }
    if (foundResource === true) {
      resource.dependsOn.push('Microsoft.Sql/servers/' + serverName);
    }
    return resource;
  }
};
