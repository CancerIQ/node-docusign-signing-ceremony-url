const { describe, it, before, beforeEach } = require('mocha');
const chai = require('chai');
const getSigningCeremonyUrl = require('../lib/get-signing-ceremony-url');
const getEnvelopeDocuments = require('../lib/get-envelope-documents');
const docusignCredentials = require('../docusign-credentials.json');

const { expect } = chai;
chai.use(require('chai-string'));

describe('getSigningCeremonyUrl', function () {
  it('retrieves a docusign url', function () {
    this.timeout(4000);

    return getSigningCeremonyUrl(
      Object.assign({
        signerName: 'Some Person',
        signerEmail: 'noreply@lolnope.com',
        returnUrl: 'http://www.hamsterdance.org/hamsterdance/',
        emailSubject: 'Hello I am an email',

        tabs: {
          signHere: [{
            documentId: 1,
            pageNumber: 1,
            recipientId: 1,
            x: 100,
            y: 100,
          }]
        }
      },
      docusignCredentials)
    ).then(response =>
      expect(response.url).to.be.a('string')
        .and
        .startWith('https://')
    );
  });
});


describe('getEnvelopeDocuments', function () {
  it('retrieves a base64 encoded pdf', function () {
    this.timeout(4000);
    let cred = docusignCredentials;
    return getEnvelopeDocuments(
      Object.assign({
        username: cred.username,
        password: cred.password,
        integratorKey: cred.integratorKey,
        docusignEnvironment: cred.docusignEnvironment,
        envelopeId: cred.envelopeId
      })
    ).then(response => {
      expect(response.type).to.equal('application/pdf');
      expect(response.header['content-transfer-encoding']).to.equal('base64');
    });
  });
});
