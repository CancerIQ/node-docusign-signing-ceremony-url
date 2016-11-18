const fs = require('fs');
const path = require('path');
const docusign = require('docusign-esign');
const _ = require('lodash');
const login = require('./login');

const recipientId = '1';
const clientUserId = '1000';
const roleName = 'signer';

/**
 * @param {docusign.EnvelopeDefinition} envelopeDefinition
 * @param {string} accountId
 * @param {string} returnUrl
 * @param {string} email
 * @param {string} userName
 * @return {Promise}
 */
function createEnvelope (
  envelopeDefinition, accountId, returnUrl, email, userName
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

    // Append envelopeId as param to returnUrl
    let returnUrlWithIdParam = insertParam(returnUrl, 'envelope_id', envelopeSummary.envelopeId);

    const recipientViewRequest = new docusign.RecipientViewRequest();
    recipientViewRequest.constructFromObject({
      authenticationMethod: 'email',
      email,
      userName,
      recipientId,
      clientUserId,
      returnUrl: returnUrlWithIdParam
    });

    resolve([recipientViewRequest, accountId, envelopeSummary.envelopeId]);
  });

  return createEnvelopePromise;
}

/**
 * @param {Array.} arr
 * @param {docusign.RecipientViewRequest} arr[0] - recipientViewRequest
 * @param {string} arr[1] - accountId
 * @param {string} arr[2] - envelopeId
 * @return {Promise}
 */
function createRecipientView ([recipientViewRequest, accountId, envelopeId]) {
  let resolve, reject;
  const createRecipientViewPromise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  (new docusign.EnvelopesApi()).createRecipientView(
    accountId,
    envelopeId,
    recipientViewRequest,
  (error, recipientView) => {
    if (error) {
      return reject('Error: ' + error);
    }
    resolve({
      url: recipientView.url,
      envelope_id: envelopeId
    });
  });

  return createRecipientViewPromise;
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
  tabs,
  email,
  name,
  clientUserId,
  roleName,
  recipientId
) {
  const templateRole = new docusign.TemplateRole();
  templateRole.constructFromObject({
    tabs,
    email,
    name,
    clientUserId,
    roleName,
    recipientId
  });

  return [templateRole];
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
  rawTabData,
  emailSubject,
  templateId,
  signerEmail,
  signerName
) {
  const envelopeDefinition = new docusign.EnvelopeDefinition();
  envelopeDefinition.constructFromObject({
    status: 'sent',
    templateRoles: createTemplateRoles(
      createTabs(rawTabData),
      signerEmail,
      signerName,
      clientUserId,
      roleName,
      recipientId
    ),
    emailSubject,
    templateId
  });

  return envelopeDefinition;
}

function getSigningCeremonyUrl ({
  docusignEnvironment = 'demo',
  signerName,
  signerEmail,
  returnUrl,
  emailSubject,

  // DocuSign credentials
  username,
  password,
  integratorKey,
  templateId,

  tabs = {}
} = {}) {

  return login(
    username,
    password,
    integratorKey,
    docusignEnvironment
  ).then(loginData =>
    createEnvelope(
      createEnvelopeDefinition(
        tabs,
        emailSubject,
        templateId,
        signerEmail,
        signerName
      ),
      loginData.accountId,
      returnUrl,
      signerEmail,
      signerName
    )
  ).then(
    createRecipientView
  );
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
