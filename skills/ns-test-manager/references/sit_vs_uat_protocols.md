# SIT vs. UAT Protocols

## SIT (System Integration Testing)
- **Who:** Developers and Consultants.
- **Focus:** Technical correctness.
- **Questions:** 
  - Do the integrations connect? 
  - Do scripts throw runtime errors? 
  - Does the data flow from Sales Order to Invoice without loss?
  - Are field permissions correctly enforced?
- **Prerequisite for UAT:** 100% of SIT test cases must pass.

## UAT (User Acceptance Testing)
- **Who:** Business Process Owners (BPOs) and End-Users.
- **Focus:** Functional usability and business alignment.
- **Questions:** 
  - Does this process solve the business pain point?
  - Is the UI intuitive for a daily user?
  - Do the printed PDF layouts meet brand standards?
  - Are the financial reports accurate and readable?
- **Prerequisite for Go-Live:** BPO sign-off on UAT results.
