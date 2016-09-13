var docusign = require('docusign-esign');
var fs = require('fs');
var path = require('path');

function getSigningCeremonyUrl ({
  signerName,
  signerEmail,
  pdfPath,
  createdPdfFileName = 'file.pdf',
  returnUrl,
  env = 'demo',
  emailSubject = 'Email subject',

  // DocuSign credentials
  username,
  password,
  integratorKey
} = {}) {

  let resolve, reject;
  const urlPromise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(`https://${env}.docusign.net/restapi`);
  apiClient.addDefaultHeader(
    'X-DocuSign-Authentication',
    JSON.stringify({
      Username: username,
      Password: password,
      IntegratorKey: integratorKey
    })
  );

  docusign.Configuration.default.setDefaultApiClient(apiClient);

  const authApi = new docusign.AuthenticationApi();
  const loginOps = new authApi.LoginOptions();

  loginOps.setApiPassword('true');
  loginOps.setIncludeAccountIdGuid('true');

  authApi.login(loginOps, (error, loginInfo) => {
    if (error) {
      return reject(error);
    }

    if (loginInfo) {
      const loginAccounts = loginInfo.getLoginAccounts();

      let fileBytes = null;
      try {
        fileBytes = fs.readFileSync(path.resolve(pdfPath));
      } catch (ex) {
        return reject(`Exception: ${ex}`);
      }

      const envDef = new docusign.EnvelopeDefinition();
      envDef.setEmailSubject(emailSubject);

      const doc = new docusign.Document();
      const base64Doc = new Buffer(fileBytes).toString('base64');

      doc.setDocumentBase64(base64Doc);
      doc.setName(createdPdfFileName); // can be different from actual file name
      doc.setDocumentId('1');

      const docs = [];
      docs.push(doc);
      envDef.setDocuments(docs);

      const signer = new docusign.Signer();
      signer.setEmail(signerEmail);
      signer.setName(signerName);
      signer.setRecipientId('1');
      signer.setClientUserId('1001');

      // FIXME: Make this configurable
      var signHere = new docusign.SignHere();
      signHere.setDocumentId('1');
      signHere.setPageNumber('1');
      signHere.setRecipientId('1');
      signHere.setXPosition('100');
      signHere.setYPosition('100');

      const signHereTabs = [];
      signHereTabs.push(signHere);
      const tabs = new docusign.Tabs();
      tabs.setSignHereTabs(signHereTabs);
      signer.setTabs(tabs);

      envDef.setRecipients(new docusign.Recipients());
      envDef.getRecipients().setSigners([]);
      envDef.getRecipients().getSigners().push(signer);
      envDef.setStatus('sent');

      const loginAccount = loginAccounts[0];
      const accountId = loginAccount.accountId;

      (new docusign.EnvelopesApi()).createEnvelope(
        accountId,
        envDef,
        null,
      (error, envelopeSummary, response) => {

        if (error) {
          return reject('Error: ' + error);
        }

        if (envelopeSummary) {
          const envelopeId = envelopeSummary.envelopeId;

          var recipientViewRequest = new docusign.RecipientViewRequest();
          recipientViewRequest.setReturnUrl(returnUrl);
          recipientViewRequest.setAuthenticationMethod('email');
          recipientViewRequest.setEmail(signerEmail);
          recipientViewRequest.setUserName(signerName);
          recipientViewRequest.setRecipientId('1');
          recipientViewRequest.setClientUserId('1001');

          // call the CreateRecipientView API
          (new docusign.EnvelopesApi()).createRecipientView(
            accountId,
            envelopeId,
            recipientViewRequest,
          (error, recipientView, response) => {
            if (error) {
              return reject('Error: ' + error);
            }

            resolve(recipientView.url);
          });
        }
      });
    }
  });

  return urlPromise;
}

module.exports = getSigningCeremonyUrl;
