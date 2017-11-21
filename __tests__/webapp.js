'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

var generator;
var template;

describe('generator-arm-template:webapp', () => {
  before(() => {
    generator = helpers.createGenerator(
      'arm-template:webapp',
      [path.join(__dirname, '../generators/webapp')],
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

  it('creates a web app', () => {
    template = generator._addResource(template, {
      name: 'testName',
      location: 'testLocation',
      appHostingPlan: 'appHostingPlan'
    });
    assert.equal(template.resources[0].type, 'Microsoft.Web/sites');
  });
});
