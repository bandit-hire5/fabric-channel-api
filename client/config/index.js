const path = require('path');

const constants = {
    ORDERER: {
        URL: 'grpcs://localhost:7050',
        CERT_PATH: path.resolve(__dirname, '../cert/orderer.pem'),
        CERT_OPTIONS: {
            'ssl-target-name-override': 'orderer.example.com',
        }
    },
    ORG1: {
        PRIVATE_KEY: path.resolve(__dirname, '../cert/org1_private_key'),
        CERT_PATH: path.resolve(__dirname, '../cert/org1_cert.pem'),
        MSPID: 'Org1MSP',
        ANCHOR_PEER_URL: 'grpcs://localhost:7051',
        ANCHOR_PEER_CERT_PATH: path.resolve(__dirname, '../cert/org1_peer_cert.pem'),
        ANCHOR_PEER_CERT_OPTIONS: {
            'ssl-target-name-override': 'peer0.org1.example.com',
        },
    },
    ORG2: {
        PRIVATE_KEY: path.resolve(__dirname, '../cert/org2_private_key'),
        CERT_PATH: path.resolve(__dirname, '../cert/org2_cert.pem'),
        MSPID: 'Org2MSP',
        ANCHOR_PEER_URL: 'grpcs://localhost:9051',
        ANCHOR_PEER_CERT_PATH: path.resolve(__dirname, '../cert/org2_peer_cert.pem'),
        ANCHOR_PEER_CERT_OPTIONS: {
            'ssl-target-name-override': 'peer0.org2.example.com',
        },
    },
    CHANNEL: {
        CONFIG_PATH: path.resolve(__dirname, 'channel.tx'),
    }
};

module.exports = constants;