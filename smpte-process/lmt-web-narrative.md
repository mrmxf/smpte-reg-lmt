## LMT preview update 2021-02-25

The following changes have been made since the project was seen in SMPTE in 2020:

1. All of the URNs were changed
  * from `urn:smpte:register:`
  * to URLs of the form: `prefix/code` where `prefix` has the non-approved value of `https://smpte-ra.org/register/lmt/id`
    * e.g.  `https://smpte-ra.org/register/lmt/code/en-au` for Australian English
2. Canonical representation changed to `JSON` (was `XML`)
3. New SMPTE logo
4. update to control document to reflect url change
5. update to conversion tool archicture to allow better IO with contributors

Pending work

a. reverse conversion to MESA/Synaptical XML
b. vetting of control document
c. imrproved SMPTE styling
d. docker encapsulation for simplified deployment
