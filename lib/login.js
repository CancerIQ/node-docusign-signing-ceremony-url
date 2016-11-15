const docusign = require('docusign-esign');

/**
 * @param {string} username
 * @param {string} password
 * @param {string} integratorKey
 * @param {string} docusignEnvironment
 * @return {Promise}
 */
function login (username, password, integratorKey, docusignEnvironment, headers) {
  let resolve, reject;
  const loginPromise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(`https://${docusignEnvironment}.docusign.net/restapi`);
  apiClient.addDefaultHeader(
    'X-DocuSign-Authentication',
    JSON.stringify({
      Username: username,
      Password: password,
      IntegratorKey: integratorKey
    })
  );

  if (headers != undefined) {
    for (hkey in headers) {
      apiClient.addDefaultHeader(hkey, headers[hkey]);
    }
  }

  docusign.Configuration.default.setDefaultApiClient(apiClient);

  const authApi = new docusign.AuthenticationApi();
  const loginOps = new authApi.LoginOptions();

  loginOps.setApiPassword('true');
  loginOps.setIncludeAccountIdGuid('true');

  authApi.login(loginOps, (error, loginInfo) => {
    if (error) {
      return reject(error);
    }

    resolve(loginInfo.getLoginAccounts()[0]);
  });

  return loginPromise;
}

module.exports = login;
