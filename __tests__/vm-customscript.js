'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

var generator;
var template;

describe('generator-arm-template:vm-customscript', () => {
  before(() => {
    generator = helpers.createGenerator(
      'arm-template:vm-customscript',
      [path.join(__dirname, '../generators/vm-customscript')],
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

  it('creates a custom script that uses the correct script name', () => {
    template = generator._addResource(template, {
      vmName: 'testName',
      location: 'testLocation',
      scriptUrl: 'http://someserver.fake/path/MyScript.ps1'
    });
    assert.equal(
      template.resources[0].type,
      'Microsoft.Compute/virtualMachines/extensions'
    );
    assert.equal(
      template.resources[0].properties.protectedSettings.commandToExecute,
      'powershell -ExecutionPolicy Unrestricted -File MyScript.ps1'
    );
  });

  it('creates a custom script that is stored outside of Azure blob storage', () => {
    template = generator._addResource(template, {
      vmName: 'testName',
      location: 'testLocation',
      scriptUrl: 'http://someserver.fake/path/MyScript.ps1'
    });
    assert.equal(
      template.resources[0].properties.protectedSettings.storageAccountName,
      undefined
    );
    assert.equal(
      template.resources[0].properties.protectedSettings.storageAccountKey,
      undefined
    );
  });

  it('creates a custom script that is stored inside Azure blob storage', () => {
    template = generator._addResource(template, {
      vmName: 'testName',
      location: 'testLocation',
      scriptUrl: 'http://testaccount.blob.core.windows.net/container/MyScript.ps1',
      storageAccountKey: 'testKey'
    });
    assert.equal(
      template.resources[0].properties.protectedSettings.storageAccountName,
      'testaccount'
    );
    assert.equal(
      template.resources[0].properties.protectedSettings.storageAccountKey,
      'testKey'
    );
  });

  it('creates a custom script that has a dependency on a VM', () => {
    template.resources.push({
      name: 'testVM',
      type: 'Microsoft.Compute/virtualMachines'
    });
    template = generator._addResource(template, {
      vmName: 'testVM',
      location: 'testLocation',
      scriptUrl: 'http://someserver.fake/path/MyScript.ps1'
    });
    assert.equal(
      template.resources[1].dependsOn[0],
      "[resourceId('Microsoft.Compute/virtualMachines', 'testVM')]"
    );
  });
});
