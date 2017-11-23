'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

var generator;
var template;

describe('generator-arm-template:networkinterface', () => {
  before(() => {
    generator = helpers.createGenerator(
      'arm-template:networkinterface',
      [path.join(__dirname, '../generators/networkinterface')],
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

  it('creates an adapter with a dynamic IP', () => {
    template = generator._addResource(template, {
      name: 'testName',
      location: 'testLocation',
      networkName: 'test',
      subnetName: 'test',
      privateIpAddress: ''
    });
    assert.equal(template.resources[0].type, 'Microsoft.Network/networkInterfaces');
    assert.equal(
      template.resources[0].properties.ipConfigurations[0].properties
        .privateIPAllocationMethod,
      'Dynamic'
    );
  });

  it('creates an adapter with a static IP', () => {
    template = generator._addResource(template, {
      name: 'testName',
      location: 'testLocation',
      networkName: 'test',
      subnetName: 'test',
      publicIpName: '',
      privateIpAddress: '192.168.0.10'
    });
    assert.equal(template.resources[0].type, 'Microsoft.Network/networkInterfaces');
    assert.equal(
      template.resources[0].properties.ipConfigurations[0].properties
        .privateIPAllocationMethod,
      'Static'
    );
    assert.equal(
      template.resources[0].properties.ipConfigurations[0].properties.privateIPAddress,
      '192.168.0.10'
    );
  });

  it('creates an adapter with no public IP', () => {
    template = generator._addResource(template, {
      name: 'testName',
      location: 'testLocation',
      networkName: 'test',
      subnetName: 'test',
      publicIpName: '',
      privateIpAddress: ''
    });
    assert.equal(template.resources[0].type, 'Microsoft.Network/networkInterfaces');
    assert.equal(
      template.resources[0].properties.ipConfigurations[0].properties.publicIPAddress,
      undefined
    );
  });

  it('creates an adapter with a public IP', () => {
    template = generator._addResource(template, {
      name: 'testName',
      location: 'testLocation',
      networkName: 'test',
      subnetName: 'test',
      publicIpName: 'TestPublicIP',
      privateIpAddress: ''
    });
    assert.equal(template.resources[0].type, 'Microsoft.Network/networkInterfaces');
    assert.equal(
      template.resources[0].properties.ipConfigurations[0].properties.publicIPAddress.id,
      "[resourceId('Microsoft.Network/publicIPAddresses', 'TestPublicIP')]"
    );
  });

  it('creates a network adapter with a dependency on a network', () => {
    template.resources.push({
      name: 'testNetwork',
      type: 'Microsoft.Network/virtualNetworks'
    });
    template = generator._addResource(template, {
      name: 'testName',
      location: 'testLocation',
      networkName: 'testNetwork',
      subnetName: 'test',
      publicIpName: '',
      privateIpAddress: ''
    });
    assert.equal(
      template.resources[1].dependsOn[0],
      'Microsoft.Network/virtualNetworks/testNetwork'
    );
  });

  it('creates a network adapter with a dependency on a network and public IP', () => {
    template.resources.push({
      name: 'testNetwork',
      type: 'Microsoft.Network/virtualNetworks'
    });
    template.resources.push({
      name: 'testIP',
      type: 'Microsoft.Network/publicIPAddresses'
    });
    template = generator._addResource(template, {
      name: 'testName',
      location: 'testLocation',
      networkName: 'testNetwork',
      subnetName: 'test',
      publicIpName: 'testIP',
      privateIpAddress: ''
    });
    assert.equal(
      template.resources[2].dependsOn[0],
      'Microsoft.Network/virtualNetworks/testNetwork'
    );
    assert.equal(
      template.resources[2].dependsOn[1],
      'Microsoft.Network/publicIPAddresses/testIP'
    );
  });
});
