import * as fs from 'fs';
import * as path from 'path';

import Client = require('fabric-client');
import {Channel, CryptoContent, Orderer, Peer} from "fabric-client";

const NETWORK_DIR = '/../../../kafka-network';
export const CHANNEL_1_PATH = NETWORK_DIR + '/channel-artifacts/channel.tx';
const KEY_STORE_PATH_ADMIN = './keystore/admin';
const ORDERER_URL = 'grpcs://localhost:7050';
const ORDERER_TLS_CAROOT_PATH = NETWORK_DIR + '/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt';

const ORG1_ADMIN_MSP = NETWORK_DIR + '/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp';
const ORG2_ADMIN_MSP = NETWORK_DIR + '/crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp';

export enum Organization {
    ORG1 = 'org1',
    ORG2 = 'org2',
}

export const ORG_LIST = {
    ORG1: Organization.ORG1,
    ORG2: Organization.ORG2,
};

export const ALLOWED_CHANNEL_LEST = [
    'mychannel',
];

export const ALLOWED_CHAINCODE_LEST = [
    'fabcar',
];

const MSP_DIR = {
    org1: ORG1_ADMIN_MSP,
    org2: ORG2_ADMIN_MSP,
};

const MSP_ID = {
    org1: 'Org1MSP',
    org2: 'Org2MSP',
};

const PEERS = {
    org1: {
        peers: [
            {
                url: 'grpcs://localhost:7051', // peer0
            },
            {
                url: 'grpcs://localhost:8051', // peer1
            },
        ]
    },
    org2: {
        peers: [
            {
                url: 'grpcs://localhost:9051', // peer0
            },
            {
                url: 'grpcs://localhost:10051', // peer1
            },
        ]
    },
};

export async function getPeers(client: Client, org: Organization): Promise<Peer[]> {
    const peers: Peer[] = [];

    for (let i = 0; i < 2; i++) {
        const tls_cacert = `${NETWORK_DIR}/crypto-config/peerOrganizations/${org}.example.com/peers/peer${i}.${org}.example.com/tls/ca.crt`;

        const data = fs.readFileSync(path.join(__dirname, tls_cacert));
        const p = client.newPeer(PEERS[org].peers[i].url, {
            'pem': Buffer.from(data).toString(),
            'ssl-target-name-override': `peer${i}.${org}.example.com`,
        });

        peers[i] = p;
    }

    return peers;
}

export async function getOrderer(client: Client): Promise<Orderer> {
    // build an orderer that will be used to connect to it
    const data = fs.readFileSync(path.join(__dirname, ORDERER_TLS_CAROOT_PATH));
    const orderer: Orderer = client.newOrderer(ORDERER_URL, {
        'pem': Buffer.from(data).toString(),
        'ssl-target-name-override': 'orderer.example.com',
    });

    return orderer;
}

export async function getClient(org: Organization): Promise<Client> {
    const client = new Client();

    Client.setConfigSetting('request-timeout', 120000);

    // ## Setup the cryptosuite (we are using the built in default s/w based implementation)
    const cryptoSuite = Client.newCryptoSuite();
    cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({
        path: `${KEY_STORE_PATH_ADMIN}-${org}`,
    }));

    client.setCryptoSuite(cryptoSuite);

    // ## Setup the default keyvalue store where the state will be stored
    const store = await Client.newDefaultKeyValueStore({
        path: `${KEY_STORE_PATH_ADMIN}-${org}`,
    });

    client.setStateStore(store);

    const ORG_ADMIN_MSP = MSP_DIR[org];

    const privateKeyFile = fs.readdirSync(__dirname + ORG_ADMIN_MSP + '/keystore')[0];

    // ###  GET THE NECESSRY KEY MATERIAL FOR THE ADMIN OF THE SPECIFIED ORG  ##
    const cryptoContentOrgAdmin: CryptoContent = {
        privateKey: path.join(__dirname, ORG_ADMIN_MSP + '/keystore/' + privateKeyFile),
        signedCert: path.join(__dirname, ORG_ADMIN_MSP + '/signcerts/Admin@' + org + '.example.com-cert.pem'),
    };

    await client.createUser({
        username: `${org}-admin`,
        mspid: MSP_ID[org],
        cryptoContent: cryptoContentOrgAdmin,
        skipPersistence: true,
    });

    return client;
}

async function getAllPeers(client: Client): Promise<Peer[]> {
    const peers: Peer[] = [];

    for (let y in ORG_LIST) {
        let org = ORG_LIST[y];

        for (let i = 0; i < 2; i++) {
            const tls_cacert = `${NETWORK_DIR}/crypto-config/peerOrganizations/${org}.example.com/peers/peer${i}.${org}.example.com/tls/ca.crt`;

            const data = fs.readFileSync(path.join(__dirname, tls_cacert));
            const p = client.newPeer(PEERS[org].peers[i].url, {
                'pem': Buffer.from(data).toString(),
                'ssl-target-name-override': `peer${i}.${org}.example.com`,
            });

            peers[i] = p;
        }
    }

    return peers;
}

export async function getChannel(client: Client, org: Organization, channelName: string): Promise<Channel> {
    const orderer = await getOrderer(client);

    const channel = client.newChannel(channelName);

    channel.addOrderer(orderer);

    //const peers = await getPeers(client, org);
    const peers = await getAllPeers(client);

    peers.map(p => channel.addPeer(p, p['grpc.ssl_target_name_override']));

    await channel.initialize();

    return channel;
}

export function getPolicy(): Object {
    return {
        identities: [
            { role: { name: "member", mspId: "Org1MSP" }},
            { role: { name: "member", mspId: "Org2MSP" }},
        ],
        policy: {
            "1-of": [{ "signed-by": 0 }, { "signed-by": 1 }]
        }
    };
    /*return {
        identities: [
            { role: { name: "member", mspId: "Org1MSP" }},
            { role: { name: "member", mspId: "Org2MSP" }},
        ],
        policy: {
            "2-of": [
                { "signed-by": 0},
                { "signed-by": 1},
            ]
        }
    };*/
}