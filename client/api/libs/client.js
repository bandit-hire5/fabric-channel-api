'use_strict';

const fs = require('fs');
const fabricClient = require('fabric-client');
const constants = require('../../config');

async function getSignedClient(orgName) {
    return new Promise((response, reject) => {
        const client = new fabricClient();

        const consts = constants[orgName];

        if (!consts) {
            reject('Unknown org name');
        }

        const private_key = fs.readFileSync(consts.PRIVATE_KEY);
        const cert = fs.readFileSync(consts.CERT_PATH);

        client.setAdminSigningIdentity(private_key, cert, consts.MSPID);

        response(client);
    });
}

module.exports = {
    getSignedClient: getSignedClient,
};