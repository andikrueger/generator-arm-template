'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

var generator;
var template;

describe('generator-arm-template:vm', () => {
  before(() => {
    generator = helpers.createGenerator(
      'arm-template:vm',
      [path.join(__dirname, '../generators/vm')],
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

  it('contains a virtual machine', () => {
    template = generator._addResource(template, {
      name: 'testName',
      location: 'testLocation',
      username: 'admin',
      password: 'password',
      publisher: 'publisher',
      offer: 'offer',
      sku: 'sku',
      version: 'latest',
      storageAccount: 'storageAccountTest',
      nic: 'nicTest'
    });
    assert.equal(template.resources[0].type, 'Microsoft.Compute/virtualMachines');
  });

  it('creates a vm with a nic and storage dependency', () => {
    template.resources.push({
      name: 'testNic',
      type: 'Microsoft.Network/networkInterfaces'
    });
    template.resources.push({
      name: 'testStorage',
      type: 'Microsoft.Storage/storageAccounts'
    });
    template = generator._addResource(template, {
      name: 'testName',
      location: 'testLocation',
      username: 'admin',
      password: 'password',
      publisher: 'publisher',
      offer: 'offer',
      sku: 'sku',
      version: 'latest',
      storageAccount: 'testStorage',
      nic: 'testNic'
    });
    assert.equal(
      template.resources[2].dependsOn[0],
      'Microsoft.Network/networkInterfaces/testNic'
    );
    assert.equal(
      template.resources[2].dependsOn[1],
      'Microsoft.Storage/storageAccounts/testStorage'
    );
  });
});
