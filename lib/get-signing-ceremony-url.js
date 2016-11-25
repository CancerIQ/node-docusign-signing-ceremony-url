const fs = require('fs');
const path = require('path');
const docusign = require('docusign-esign');
const _ = require('lodash');
const login = require('./login');

// const recipientId = '1';
const clientUserId = '1000';
const roleName = 'signer';

/**
 * @param {docusign.EnvelopeDefinition} envelopeDefinition
 * @param {string} accountId
 * @return {Promise}
 */
function createEnvelope (
  envelopeDefinition, accountId
) {
  let resolve, reject;
  const createEnvelopePromise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  (new docusign.EnvelopesApi()).createEnvelope(
    accountId,
    envelopeDefinition,
    null,
  (error, envelopeSummary) => {
    if (error) {
      return reject(error);
    }
    resolve(envelopeSummary.envelopeId);
  });

  return createEnvelopePromise;
}

function createRecipientView(accountId, userName, envelopeId, signer, returnUrl, recipientId, clientUserId) {
  let resolve, reject;
  const createRecipientViewPromise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  let recipientViewRequest = new docusign.RecipientViewRequest();
  recipientViewRequest.constructFromObject({
    authenticationMethod: 'email',
    email: signer.email,
    userName: signer.name,
    recipientId,
    clientUserId,
    returnUrl
  });

  (new docusign.EnvelopesApi()).createRecipientView(
    accountId,
    envelopeId,
    recipientViewRequest,
    (error, recipientView) => {
      if (error) {
        console.log(error);
        return reject('Error: ' + error);
      }
      resolve({
        url: recipientView.url,
        envelope_id: envelopeId
      });
    });

  return createRecipientViewPromise;
}

function createRecipientViewChain(accountId, userName, envelopeId, Signers, finalReturnUrl, clientUserId){
  let nextReturnUrl= insertParam(finalReturnUrl, 'envelope_id', envelopeId);
  let chain = Promise.resolve({url: nextReturnUrl});
  let signingUrls = [];

  // Iterate backwards to set appropriate url chaining order
  for (let i = Signers.length - 1; i >= 0; i--) {
    let signer = Signers[i];
    chain = chain.then((res) => {
      let signingUrl = res.url;
      signingUrls.push(signingUrl);
      let recipientId = (Signers.length - (i + 1)).toString();
      return createRecipientView(accountId, userName, envelopeId, signer, signingUrl, recipientId, clientUserId);
    });
  }
  return chain;
}

/**
 * @param {Object.<Array>} tabs
 * @return {docusign.Tabs}
 */
function createTabs (tabs) {
  const docusignTabs = new docusign.Tabs();
  docusignTabs.constructFromObject(
    _.mapValues(

      // Map the key names to conform to the docusign spec
      _.mapKeys(tabs, (v, key) => `${key}Tabs`),

      // Map values to conform to docusign spec
      tabArray => _.map(tabArray,
        tab => _.extend(_.clone(tab), {
          documentId: tab.documentId.toString(),
          pageNumber: tab.pageNumber.toString(),
          recipientId: tab.recipientId.toString(),
          xPosition: tab.x.toString(),
          yPosition: tab.y.toString()
        })
      )

    )
  );

  return docusignTabs;
}

/**
 * @param {docusign.Tabs} tabs
 * @param {string} email
 * @param {string} name
 * @param {string} clientUserId
 * @param {string} roleName
 * @param {string} recipientId
 * @return {Array.<docusign.TemplateRole>}
 */
function createTemplateRoles (
  Signers,
  clientUserId,
  roleName
) {
  let templateRoles = [];
  for (let i in Signers) {
    let signer = Signers[i];
    let templateRole = new docusign.TemplateRole();
    let tabs = createTabs(signer.tabs);
    templateRole.constructFromObject({
      tabs: tabs,
      email: signer.email,
      name: signer.name,
      clientUserId,
      roleName,
      recipientId: i.toString()
    });
    templateRoles.push(templateRole);
  }

  return templateRoles;
}

/**
 * @param {Object} rawTabData
 * @param {string} emailSubject
 * @param {string} templateId
 * @param {string} signerEmail
 * @param {string} signerName
 * @return {docusign.EnvelopeDefinition}
 */
function createEnvelopeDefinition (
  Signers,
  emailSubject,
  templateId
) {
  const envelopeDefinition = new docusign.EnvelopeDefinition();
  envelopeDefinition.constructFromObject({
    status: 'sent',
    templateRoles: createTemplateRoles(
      Signers,
      clientUserId,
      roleName
    ),
    emailSubject,
    templateId
  });
  return envelopeDefinition;
}

function getSigningCeremonyUrl ({
  docusignEnvironment = 'demo',
  Signers,
  returnUrl,
  emailSubject,

  // DocuSign credentials
  username,
  password,
  integratorKey,
  templateId
} = {}) {

  let envelopeDefinition = createEnvelopeDefinition(
    Signers,
    emailSubject,
    templateId
  );

  let accountId;

  return login(
    username,
    password,
    integratorKey,
    docusignEnvironment
  ).then(loginData => {
    accountId = loginData.accountId;
    return createEnvelope(envelopeDefinition, accountId);
  }).then(envelopeId => {
    return createRecipientViewChain(accountId,
                                    username,
                                    envelopeId,
                                    Signers,
                                    returnUrl,
                                    clientUserId);
  })
}


/**
 *
 * @param {string} url
 * @param {string} key
 * @param {string} value
 * @returns {string}
 */
function insertParam(url, key, value) {
  if (url.indexOf('?') === -1) {
    url += '?';
  } else {
    url += '&';
  }
  return url + key + '=' + value;
}

module.exports = getSigningCeremonyUrl;
