'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

var generator;
var template;

describe('generator-arm-template:sqldatabase', () => {
  before(() => {
    generator = helpers.createGenerator(
      'arm-template:sqldatabase',
      [path.join(__dirname, '../generators/sqldatabase')],
      null,
      null
    );
  });
  beforeEach(() => {
    template = {
      $schema:
        'https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#',
      contentVersion: '1.0.0.0',
      parameters: {},
      variables: {},
      resources: [],
      outputs: {}
    };
  });

  it('contains a database on the basic tier', () => {
    template = generator._addResource(template, {
      name: 'testName',
      location: 'testLocation',
      collation: 'SQL_Latin1_General_CP1_CI_AS',
      serverName: 'test',
      edition: 'Basic',
      basicStorage: '100MB'
    });
    assert.equal(template.resources[0].type, 'Microsoft.Sql/servers/databases');
    assert.equal(template.resources[0].properties.maxSizeBytes, '104857600');
    assert.equal(template.resources[0].properties.edition, 'Basic');
  });

  it('contains a database on the standard tier', () => {
    template = generator._addResource(template, {
      name: 'testName',
      location: 'testLocation',
      collation: 'SQL_Latin1_General_CP1_CI_AS',
      serverName: 'test',
      edition: 'Standard',
      standardTier: 'S1',
      standardStorage: '100MB'
    });
    assert.equal(template.resources[0].type, 'Microsoft.Sql/servers/databases');
    assert.equal(template.resources[0].properties.maxSizeBytes, '104857600');
    assert.equal(template.resources[0].properties.edition, 'Standard');
    assert.equal(template.resources[0].properties.requestedServiceObjectiveName, 'S1');
  });

  it('contains a database on the premium tier', () => {
    template = generator._addResource(template, {
      name: 'testName',
      location: 'testLocation',
      collation: 'SQL_Latin1_General_CP1_CI_AS',
      serverName: 'test',
      edition: 'Premium',
      premiumTier: 'P1',
      premiumStorage: '100MB'
    });
    assert.equal(template.resources[0].type, 'Microsoft.Sql/servers/databases');
    assert.equal(template.resources[0].properties.maxSizeBytes, '104857600');
    assert.equal(template.resources[0].properties.edition, 'Premium');
    assert.equal(template.resources[0].properties.requestedServiceObjectiveName, 'P1');
  });

  it('creates a dependency on the logical server when it is in the template', () => {
    template.resources.push({
      type: 'Microsoft.Sql/servers',
      name: 'testServer'
    });

    template = generator._addResource(template, {
      name: 'testName',
      location: 'testLocation',
      collation: 'SQL_Latin1_General_CP1_CI_AS',
      serverName: 'testServer',
      edition: 'Premium',
      premiumTier: 'P1',
      premiumStorage: '100MB'
    });

    assert.equal(template.resources[1].dependsOn[0], 'Microsoft.Sql/servers/testServer');
  });
});
