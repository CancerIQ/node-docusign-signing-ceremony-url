const docusign = require('docusign-esign');
const login = require('./login');

function getEnvelopeDocuments ({
  username,
  password,
  integratorKey,
  docusignEnvironment,
  envelopeId
} = {}) {

  headers = {"Content-Transfer-Encoding": "base64"};
  return login(
    username,
    password,
    integratorKey,
    docusignEnvironment,
    headers
  ).then(loginData => {
    let resolve, reject;
    const getDocumentsPromise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    (new docusign.EnvelopesApi()).getDocument(
      loginData.accountId,
      envelopeId,
      'combined',
      (error, res, body) => {
        if (error) {
          return reject(error);
        }
        return resolve(body);
      }
    );
    return getDocumentsPromise;
  })
};

module.exports = getEnvelopeDocuments;
