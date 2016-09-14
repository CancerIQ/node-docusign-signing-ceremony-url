const getSigningCeremonyUrl = require('./lib/get-signing-ceremony-url');

getSigningCeremonyUrl({
  signerName: 'Jeremy Kahn',
  signerEmail: 'jkahn@canceriq.com',
  pdfPath: 'test.pdf',
  createdPdfFileName: 'hamburger.pdf',
  returnUrl: 'https://www.docusign.com/devcenter',
  emailSubject: 'Hello I am an email',

  // DocuSign credentials
  username: '',
  password: '',
  integratorKey: ''
  signHereTabs: [{
    documentId: 1,
    pageNumber: 1,
    recipientId: 1,
    x: 100,
    y: 100
  }]
}).then(
  url => require('child_process').exec(`open ${url}`)
).catch(
  err => console.error(err)
);
