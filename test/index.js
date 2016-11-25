const { describe, it, before, beforeEach } = require('mocha');
const chai = require('chai');
const getSigningCeremonyUrl = require('../lib/get-signing-ceremony-url');
const getEnvelopeDocuments = require('../lib/get-envelope-documents');
const docusignCredentials = require('../docusign-credentials.json');

const { expect } = chai;
chai.use(require('chai-string'));

describe('getSigningCeremonyUrl', function () {
  it('retrieves a docusign url', function () {
    this.timeout(20000);

    var Signers = [
      {
        email: 'signer1@email.com',
        name: 'Mike Signer',
        tabs: {
          signHere: [{
            documentId: 1,
            pageNumber: 1,
            recipientId: 0,
            x: 100,
            y: 100
          }]
        }
      },
      {
        email: 'signer2@email.com',
        name: 'Matt Signer',
        tabs: {
          signHere: [{
            documentId: 1,
            pageNumber: 1,
            recipientId: 1,
            x: 400,
            y: 400
          }]
        }
      }
    ];

    return getSigningCeremonyUrl(
      Object.assign({
        Signers: Signers,
        returnUrl: 'http://www.hamsterdance.org/hamsterdance/',
        emailSubject: 'Hello I am an email'
      },
      docusignCredentials)
    ).then(response => {
      console.log(response);
      expect(response.url).to.be.a('string')
        .and
        .startWith('https://');
    },
           err => console.log(err)
    );
  });
});


// describe('getEnvelopeDocuments', function () {
//   it('retrieves a base64 encoded pdf', function () {
//     this.timeout(4000);
//     let cred = docusignCredentials;
//     return getEnvelopeDocuments(
//       Object.assign({
//         username: cred.username,
//         password: cred.password,
//         integratorKey: cred.integratorKey,
//         docusignEnvironment: cred.docusignEnvironment,
//         envelopeId: cred.envelopeId
//       })
//     ).then(response => {
//       expect(response.type).to.equal('application/pdf');
//       expect(response.header['content-transfer-encoding']).to.equal('base64');
//     });
//   });
// });
