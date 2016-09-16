const getSigningCeremonyUrl = require('./lib/get-signing-ceremony-url');

getSigningCeremonyUrl({
  signerName: 'Jeremy Kahn',
  signerEmail: 'jkahn@canceriq.com',
  returnUrl: 'https://www.docusign.com/devcenter',
  emailSubject: 'Hello I am an email',

  username: '',
  password: '',
  integratorKey: ''
  templateId: '67a6d2e7-4dc9-4498-a5a8-ee0043717636',

  signHereTabs: [{
    documentId: 1,
    pageNumber: 1,
    recipientId: 1,
    x: 100,
    y: 100,
    label: 'Please sign here!'
  }, {
    documentId: 1,
    pageNumber: 1,
    recipientId: 1,
    x: 300,
    y: 300,
    label: 'Also here.'
  }]
}).then(
  url => require('child_process').exec(`open ${url}`)
).catch(
  console.error
);
