# node-docusign-signing-ceremony-url

Provide configuration data, get an embeddable Docusign signing ceremony URL.

Docusign provides an [official Node frontend for its API](https://github.com/docusign/docusign-node-client), but for simple tasks, it can be a little... convoluted.  This package is a wrapper over Docusign's API that focuses on exactly one thing: Generating a URL for a "signing ceremony."  A "signing ceremony," in Docusign's parlance, is a UX wherein a user can sign and submit a document.

This package exports a function called `getSigningCeremonyUrl`, which returns a promise that resolves to a signing ceremony URL:

````javascript
const getSigningCeremonyUrl = require('get-signing-ceremony-url');

getSigningCeremonyUrl({
  signerName: 'Johnny Signer',
  signerEmail: 'noreply@lolstopreplying.com',
  returnUrl: 'http://www.hamsterdance.org/hamsterdance/',
  emailSubject: 'Hello I am an email',

  // Replace these fields with actual credentials if you want anything to work
  username: 'hey-hey-hey-put-your-docusign-login-info@here.pizza',
  password: 'correct horse battery staple',
  integratorKey: 'i-dont-actually-know-why-docusign-needs-this-but-hey-whatever-just-paste-it-in-here'
  templateId: 'you-really-should-put-a-template-id-here',

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
}).then(
  url => require('child_process').exec(`open ${url}`)
).catch(
  console.error
);
````

Current this package assumes that the document you want to have signed is already [uploaded to Docusign as a template](https://support.docusign.com/guides/ndse-user-guide-working-with-templates).  Read [this](https://www.docusign.com/DocuSignHelp/Content/template-id.htm) to learn how to find a template's ID.
