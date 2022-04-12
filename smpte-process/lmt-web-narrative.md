## LMT preview update 2022-04-12

* **Done**
  * Validation errors now show parent object (& can be printed to PDF)
  * Mesa XML import reports import errors due to duplicate terms
  * lmt-control.pdf updated to reflect current JSON schema
* **@ToDo**
  * Diff engine - optional extra
  * MESA team to respond to highlights in lmt-control.pdf
  * Bruce to initiate SMPTE process once proponents identified

## LMT preview update 2022-04-06

* feature - need a click through to find errored term
  * /terms/142/Code missing a code value ("AudioLanguageTag": "ts")
  * /groups/27/Code missing a code value ("Name": "Special")
  * /groups/29/Code missing a code value ("Name": "Tsonga",)
* feature - validate that imported term counts match correctly
  * CA is missing from import

## LMT preview update 2022-01-12

The following changes have been made since the project was seen in SMPTE in 2020:

1. All of the URNs were changed
  * from `urn:smpte:register:`
  * to URLs of the form: `prefix/code` where `prefix` has the non-approved value of `https://smpte-ra.org/register/lmt/id`
    * e.g.  `https://smpte-ra.org/register/lmt/code/en-au` for Australian English
2. Canonical representation changed to `JSON` (was `XML`)
3. New SMPTE logo
4. update to control document to reflect url change
5. update to conversion tool archicture to allow better IO with contributors
6. JSON validation schema created and tested
7. converter tested with historic exports from Synaptica
8. New SMPTE submission  document 50% complete

In addition the entire tools suite has be re-written to make it more usable for end-users and maintainers.

#### Required - Pending work

1. complete the SMPTE document (eta 2022-01-15
2. update the SMPTE project document with proponents who are SMPTE standards members

#### Optional -  Pending work

1. reverse conversion to MESA/Synaptical XML (needs sample mesa document)
2. docker encapsulation for simplified deployment
3. simplify conversion workflow with some automation helpers
4. implement the difference tool

#### work complete

1. refactor engine to allow multiple register plugins
2. remove all react and custom framework javascript
3. simplify formatting & interaction with [fomantic-ui](https://fomantic-ui.com)
4. refactor LMT plugin so it's based on [smaple-plugin](https://github.com/mrmxf/smpte-ra-tool-simple-registers/tree/master/registers/sample-register)
5. refactor validation tool to improve error reporting for non-experts
6. refactor conversion tool to allow multiple conversion plugins to the LMT project
