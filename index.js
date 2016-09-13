const getSigningCeremonyUrl = require('./lib/get-signing-ceremony-url');

getSigningCeremonyUrl({
  signerName: '',
  signerEmail: '',
  pdfPath: 'test.pdf',
  createdPdfFileName: 'hamburger.pdf',
  returnUrl: 'https://www.docusign.com/devcenter',
  emailSubject: 'Hello I am an email',

  // DocuSign credentials
  username: '',
  password: '',
  integratorKey: ''
}).then(
  url => require('child_process').exec(`open ${url}`)
).catch(
  err => console.error(err)
);
