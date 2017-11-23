# generator-arm-template

[![NPM version][npm-image]][npm-url] [![Build status][appveyor-image]][appveyor-url]
 [![Dependency Status][daviddm-image]][daviddm-url]
> Azure Resource Manager template tools, built especially for VS Code!

If you author Azure Resource Manager (ARM) templates with Visual Studio code, then
this is the package for you. Leverage the power of [Yeoman](http://yeoman.io) to speed
up your development. Leverage the main arm-template generator to get you started, and
then add resources with the sub-generators to build up your template!

## Installation

First, install [Yeoman](http://yeoman.io) and generator-arm-template using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

```bash
npm install -g yo
npm install -g generator-arm-template
```

Then generate your new project:

```bash
yo arm-template
```

## Generator list

As well as the main generator, you can also use the following sub-generators. These
are all designed to modify ARM template files that were created with the main generator
so be sure to call that first.

* networkinterface
* publicip
* storageaccount
* virtualnetwork
* vm
* vm-customscript
* vm-dscextension
* apphostingplan
* webapp
* logicapp
* sqlserver
* sqldatabase

To call a sub-generator use the following syntax (this example will create a
storage account, just swap in the sub-generator you wish to use from the
above list).

```bash
yo arm-template:storageaccount
```

## Change log

For a full history of changes check out the [Change log](CHANGELOG.md)

## License

MIT © [Brian Farnhill](http://brianfarnhill.com)

[npm-image]: https://badge.fury.io/js/generator-arm-template.svg
[npm-url]: https://npmjs.org/package/generator-arm-template
[daviddm-image]: https://david-dm.org/BrianFarnhill/generator-arm-template.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/BrianFarnhill/generator-arm-template
[appveyor-image]: https://ci.appveyor.com/api/projects/status/jfhys9pjk393q445?svg=true
[appveyor-url]: https://ci.appveyor.com/project/BrianFarnhill/generator-arm-template
