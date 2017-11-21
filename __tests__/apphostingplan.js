'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

var generator;
var template;

describe('generator-arm-template:apphostingplan', () => {
  before(() => {
    generator = helpers.createGenerator(
      'arm-template:apphostingplan',
      [path.join(__dirname, '../generators/apphostingplan')],
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

  it('creates an app plan with a free/shared tier', () => {
    template = generator._addResource(template, {
      name: 'testName',
      location: 'testLocation',
      tier: 'Free'
    });
    assert.equal(template.resources[0].type, 'Microsoft.Web/serverfarms');
    assert.equal(template.resources[0].sku.capacity, 0);
  });

  it('creates an app plan with a basic/standard/premium tier', () => {
    template = generator._addResource(template, {
      name: 'testName',
      location: 'testLocation',
      tier: 'Standard',
      tierSize: 2
    });
    assert.equal(template.resources[0].type, 'Microsoft.Web/serverfarms');
    assert.equal(template.resources[0].sku.capacity, 1);
    assert.equal(template.resources[0].sku.size, 'S2');
  });
});
