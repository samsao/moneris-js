'use strict';

// Imports
const axios = require('axios');
const xml = require('xml2js');
const Promise = require('bluebird');
Promise.promisifyAll(xml);

// Globals (from Moneris PHP API)
const globals = require('./constants/globals.json');

// Intermediaries
const xmlBuilder = new xml.Builder();
xmlBuilder.options.rootName = 'request';

module.exports = function send(credentials, req, extended) {
  if (extended === undefined) {
    extended = null;
  }
  if (!credentials || !req || !req.type || !credentials.store_id || !credentials.api_token) {
    return Promise.reject(new TypeError('Requires country_code, store_id, api_token'));
  }
  if (credentials.country_code) {
    credentials.country_code = credentials.country_code.toUpperCase();
    if (credentials.country_code !== 'CA' && !globals.hasOwnProperty(credentials.country_code + '_HOST')) {
      return Promise.reject(new TypeError('Invalid country code'));
    }
  }
  let data = {
    store_id: credentials.store_id,
    api_token: credentials.api_token,
  };
  if (req.type === 'attribute_query' || req.type === 'session_query') {
    data.risk = {};
    data.risk[req.type] = req;
  } else {
    data[req.type] = req;
    delete data[req.type].type;
  }
  if (extended) {
    for (let key in extended) {
      if (extended.hasOwnProperty(key) && !data.hasOwnProperty(key)) {
        data[key] = extended[key];
      }
    }
  }
  let prefix = '';
  if (!!credentials.country_code && credentials.country_code !== 'CA') {
    prefix += credentials.country_code + '_';
  }
  let hostPrefix = prefix;
  let filePrefix = prefix;
  if (credentials.test) {
    hostPrefix += 'TEST_';
  }
  if (req.type === 'acs' || req.type === 'txn') {
    filePrefix += 'MPI_';
  }

  const options = {
    uri: globals.PROTOCOL + '://' + globals[hostPrefix + 'HOST'] + ':' + globals[filePrefix + 'FILE'],
    method: 'POST',
    body: xmlBuilder.buildObject(data),
    headers: {
      'User-Agent': globals.API_VERSION,
    },
    timeout: globals.CLIENT_TIMEOUT * 1000,
  };

  const request = {
    method: 'post',
    data: xmlBuilder.buildObject(data),
    url: globals.PROTOCOL + '://' + globals[hostPrefix + 'HOST'] + ':' + globals.PORT + globals[filePrefix + 'FILE'],
    timeout: globals.CLIENT_TIMEOUT * 1000,
    headers: {
      'User-Agent': globals.API_VERSION,
    },
  };

  return axios(request)
    .then(res => xml.parseStringAsync(res))
    .then(resp => (Array.isArray(resp.receipt) ? resp.receipt[0] : resp.receipt));
};
