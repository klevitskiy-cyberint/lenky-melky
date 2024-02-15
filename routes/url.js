const fs = require('fs');
const express = require('express');
const axios = require('axios').default;
const https = require('https');
const bunyan = require('bunyan');

var log = bunyan.createLogger({name: "url"});

var router = express.Router();

const agent = new https.Agent({
  rejectUnauthorized: false,
});

if (fs.existsSync('.env')) {
  // eslint-disable-next-line global-require
  require('dotenv').config();
}

/* GET url listing. */
router.get('/', async function(req, res, next) {

  // Access the provided 'url' query parameter
  const url = Buffer.from(req.query.value, 'base64');
  const decodedUrl = url.toString('utf8');
  log.info(`decodedUrl: ${decodedUrl}`);

  // get kasm images list
  const imagesList = await getKasmImagesList();
  const image_id = imagesList.res.body.images.filter((image) => image.friendly_name == process.env.KASM_IMAGE_NAME)[0].image_id;
  log.info(`image_id: ${image_id}`);

  // create kasm temp user
  const user = await createKasmUser();
  const user_id = user.res.body.user.user_id;
  log.info(`user_id: ${user_id}`);

  // request kasm
  let kasm = await requestKasm(image_id, user_id, decodedUrl);
  if (kasm.res.body.error_message) {
    log.info(`Problem happened: ${kasm.res.body.error_message}`);
    if (process.env.ENABLE_FORCE_KASM_DESTROY === 'false') {
      throw Error(kasm.res.body.error_message);
    } else {
      log.info(`ENABLE_FORCE_KASM_DESTROY policy enabled, making retry...`);

      // delete live session and try to create it again
      const sessions = await getKasmSessionsList();
      const live_kasm_id = sessions.res.body.kasms[0].kasm_id;
      log.info(`live_kasm_id: ${live_kasm_id}`);
      
      // get owner of kasm
      const owner_id = sessions.res.body.kasms[0].user_id;

      // destroy kasm
      const status = await destroyKasmSession(owner_id, live_kasm_id);
      if (JSON.stringify(status.res.body) === '{}') {
        // retry request kasm
        kasm = await requestKasm(image_id, user_id, decodedUrl);
      } else {
        log.error(`Failed after 2 attempts`);
        throw Error(kasm.res.body.error_message);
      }
    }
  }
  const kasm_url = kasm.res.body.kasm_url;
  log.info(`kasm_url: ${kasm_url}`);

  res.send(`${process.env.KASM_BASE_URL}${kasm_url}?disable_control_panel=1&disable_tips=1&disable_chat=1&disable_fixed_res=1`);
});

/**
 * Retrieve a list of available images.
 * @returns Array image
 */
async function getKasmImagesList() {

  const options = {
    url: `${process.env.KASM_BASE_URL}/api/public/get_images`,
    method: 'POST',
    httpsAgent: agent,
    headers: {
        'Content-Type': 'application/json'
    },
    data: {
      'api_key': process.env.KASM_CLIENT_ID,
      'api_key_secret': process.env.KASM_CLIENT_SECRET,
    },
  };

  try {
    const response = await axios(options);
    return handleRes(response);
  } catch (error) {
    log.error(error);
  }
}

/**
 * Create a new tech user.
 * @returns Object user
 */
async function createKasmUser() {
  const options = {
    url: `${process.env.KASM_BASE_URL}/api/public/create_user`,
    method: 'POST',
    httpsAgent: agent,
    headers: {
        'Content-Type': 'application/json'
    },
    data: {
      'api_key': process.env.KASM_CLIENT_ID,
      'api_key_secret': process.env.KASM_CLIENT_SECRET,
        'target_user': {
          'username' : `tech_user+${Math.floor(Math.random() * 99999)}@cyberint.com`,
          'first_name' : `Tech${Math.floor(Math.random() * 99999)}`,
          'last_name' : 'User',
          'locked': false,
          'disabled': false,
          'organization': 'Cyberint',
          'phone': '',
          'password': 'Init123$'
      }
    },
  };

  try {
    const response = await axios(options);
    return handleRes(response);
  } catch (error) {
    log.error(error);
  }
}

/**
 * Request for a new Kasm session to be created.
 * @param {String} image_id kasm image id
 * @param {String} user_id kasm user id
 * @returns Object kasm
 */
async function requestKasm(image_id, user_id, decodedUrl) {
  const options = {
    url: `${process.env.KASM_BASE_URL}/api/public/request_kasm`,
    method: 'POST',
    httpsAgent: agent,
    headers: {
        'Content-Type': 'application/json'
    },
    data: {
        'api_key': process.env.KASM_CLIENT_ID,
        'api_key_secret': process.env.KASM_CLIENT_SECRET,
        "user_id": user_id,
        "image_id": image_id,
        "enable_sharing": true,
        "kasm_url": decodedUrl,
        "environment": {}
    },
  };

  try {
    const response = await axios(options);
    return handleRes(response);
  } catch (error) {
    log.error(error);
  }
}

/**
 * Retrieve a list of live sessions.
 * @returns Array image
 */
async function getKasmSessionsList() {

  const options = {
    url: `${process.env.KASM_BASE_URL}/api/public/get_kasms`,
    method: 'POST',
    httpsAgent: agent,
    headers: {
        'Content-Type': 'application/json'
    },
    data: {
      'api_key': process.env.KASM_CLIENT_ID,
      'api_key_secret': process.env.KASM_CLIENT_SECRET,
    },
  };

  try {
    const response = await axios(options);
    return handleRes(response);
  } catch (error) {
    log.error(error);
  }
}

/**
 * Destroy a Kasm session.
 * @returns Object empty
 */
async function destroyKasmSession(user_id, kasm_id) {

  const options = {
    url: `${process.env.KASM_BASE_URL}/api/public/destroy_kasm`,
    method: 'POST',
    httpsAgent: agent,
    headers: {
        'Content-Type': 'application/json'
    },
    data: {
      'api_key': process.env.KASM_CLIENT_ID,
      'api_key_secret': process.env.KASM_CLIENT_SECRET,
      "kasm_id": kasm_id,
      "user_id": user_id,
    },
  };

  try {
    const response = await axios(options);
    return handleRes(response);
  } catch (error) {
    log.error(error);
  }
}

/**
 * Retrieve the properties of an existing user.
 * @returns Object user
 */
async function getKasmUser(username) {

  const options = {
    url: `${process.env.KASM_BASE_URL}/api/public/get_user`,
    method: 'POST',
    httpsAgent: agent,
    headers: {
        'Content-Type': 'application/json'
    },
    data: {
      'api_key': process.env.KASM_CLIENT_ID,
      'api_key_secret': process.env.KASM_CLIENT_SECRET,
      "target_user": {
        "username": username,
        },
    },
  };

  try {
    const response = await axios(options);
    return handleRes(response);
  } catch (error) {
    log.error(error);
  }
}

/**
 * Handler for server responses
 * @param {*} response 
 * @returns 
 */
function handleRes(response) {
  if (!response || typeof response !== 'object') {
    return {
      res: {
        status: 500,
        body: isNode
          ? 'Request error'
          : 'Request error'
      }
    };
  }
  return {
    res: {
      header: response.headers,
      status: response.status,
      body: response.data
    }
  };
}

module.exports = router;
