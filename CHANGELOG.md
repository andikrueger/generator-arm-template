# Change log

## 0.2.0

* Fixed missing dependency on "yeoman-generator"
* Added resources:
  * apphostingplan
  * webapp
  * logicapp
  * sqlserver
  * sqldatabase
* Automatically update dependsOn attribute when resources that are added depend
  on other resources that exist in the same template
* Removed unnecessary code from main deployment script

## v0.1.2

* Initial release, including template for
  * arm-template projects
  * storage accounts
  * network adapters
  * virtual networks
  * public IPs
  * Windows VMs
  * DSC extension
  * Custom script extension
