const getSigningCeremonyUrl = require('./lib/get-signing-ceremony-url');
const docusignCredentials = require('./docusign-credentials.json');

getSigningCeremonyUrl(
  Object.assign({
    signerName: 'Jeremy Kahn',
    signerEmail: 'noreply@canceriq.com',
    returnUrl: 'https://www.docusign.com/devcenter',
    emailSubject: 'Hello I am an email',
    templateId: '67a6d2e7-4dc9-4498-a5a8-ee0043717636',

    tabs: {
      signHere: [{
        documentId: 1,
        pageNumber: 1,
        recipientId: 1,
        x: 100,
        y: 100,
      }, {
        documentId: 1,
        pageNumber: 1,
        recipientId: 1,
        x: 300,
        y: 300,
      }],
      date: [{
        documentId: 1,
        pageNumber: 1,
        recipientId: 1,
        x: 0,
        y: 0
      }]
    }
  },
  docusignCredentials)
).then(
  url => require('child_process').exec(`open ${url}`)
).catch(
  console.error
);
