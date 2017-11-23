'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

var generator;
var template;

describe('generator-arm-template:vm-dscextension', () => {
  before(() => {
    generator = helpers.createGenerator(
      'arm-template:vm-dscextension',
      [path.join(__dirname, '../generators/vm-dscextension')],
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

  it('creates an instance of the DSC extension', () => {
    template = generator._addResource(template, {
      vmName: 'testName',
      location: 'testLocation',
      modulesUrl: 'test',
      configurationFunction: 'test',
      sasToken: 'test'
    });
    assert.equal(
      template.resources[0].type,
      'Microsoft.Compute/virtualMachines/extensions'
    );
  });

  it('creates an instance of the DSC extension with a dependency on a VM', () => {
    template.resources.push({
      name: 'testVM',
      type: 'Microsoft.Compute/virtualMachines'
    });
    template = generator._addResource(template, {
      vmName: 'testVM',
      location: 'testLocation',
      modulesUrl: 'test',
      configurationFunction: 'test',
      sasToken: 'test'
    });
    assert.equal(
      template.resources[1].dependsOn[0],
      "[resourceId('Microsoft.Compute/virtualMachines', 'testVM')]"
    );
  });
});
