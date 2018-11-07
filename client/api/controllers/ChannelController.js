'use strict';

const fs = require('fs');
const constants = require('../../config');
const clientLib = require('../libs/client');

exports.create = function(req, res) {
    if (!req.body.name) {
        console.log('Field name is required');
        res.send('Field name is required');
    }

    let orgName = (req.body.org && req.body.org.toUpperCase()) || 'ORG1';
    let channelName = req.body.name;

    clientLib.getSignedClient(orgName)
        .then(client => {
            const envelope = fs.readFileSync(constants.CHANNEL.CONFIG_PATH);
            const channelConfig = client.extractChannelConfig(envelope);
            const signature = client.signChannelConfig(channelConfig);

            const tx_id = client.newTransactionID(true);

            const data = fs.readFileSync(constants.ORDERER.CERT_PATH);
            const orderer = client.newOrderer(constants.ORDERER.URL, {
                pem: Buffer.from(data).toString(),
                ...constants.ORDERER.CERT_OPTIONS,
            });

            const request = {
                config: channelConfig,
                signatures: [signature],
                orderer: orderer,
                name: channelName,
                txId: tx_id,
            };

            return client.createChannel(request);
        })
        .then(response => {
            console.log(response);
            res.json('OK');
        })
        .catch(err => {
            res.send(err);
        });
};

exports.join = function(req, res) {
    if (!req.body.name) {
        console.log('Field name is required');
        res.send('Field name is required');
    }

    if (!req.body.org) {
        console.log('Field org is required');
        res.send('Field org is required');
    }

    let orgName = req.body.org.toUpperCase();
    let channelName = req.body.name;
    let fabricClient = null;
    let channel = null;

    clientLib.getSignedClient(orgName)
        .then(client => {
            fabricClient = client;

            channel = client.newChannel(channelName);

            const odata = fs.readFileSync(constants.ORDERER.CERT_PATH);
            const orderer = client.newOrderer(constants.ORDERER.URL, {
                pem: Buffer.from(odata).toString(),
                ...constants.ORDERER.CERT_OPTIONS,
            });

            channel.addOrderer(orderer);

            const consts = constants[orgName];

            const pdata = fs.readFileSync(consts.ANCHOR_PEER_CERT_PATH);
            const peer = client.newPeer(consts.ANCHOR_PEER_URL, {
                pem: Buffer.from(pdata).toString(),
                ...consts.ANCHOR_PEER_CERT_OPTIONS,
            });

            channel.addPeer(peer);

            const tx_id = client.newTransactionID(true);
            let q_request = {
                txId: tx_id,
            };

            return channel.getGenesisBlock(q_request);
        })
        .then(block => {
            const genesis_block = block;

            const tx_id = fabricClient.newTransactionID(true);

            const j_request = {
                block: genesis_block,
                txId: tx_id,
            };

            return channel.joinChannel(j_request);
        })
        .then((results) =>{
            if (results && results.response && results.response.status === 200) {
                console.log(results);
                res.json('OK');
            }

            res.send(results);
        })
        .catch(err => {
            res.send(err);
        });
};