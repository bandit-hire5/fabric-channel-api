import * as fs from 'fs';
import * as path from 'path';
import config from '../config';

import Client = require('fabric-client');
import {Channel, CryptoContent, Orderer, Peer} from "fabric-client";

const NETWORK_DIR = '/../../../kafka-network';
const KEY_STORE_PATH_ADMIN = './keystore/admin';
const ORDERER_URL = config.orderer.url;
const ORDERER_TLS_CAROOT_PATH = `${NETWORK_DIR}${config.orderer.cacert}`;

const ORG1_ADMIN_MSP = `${NETWORK_DIR}${config.orgs.org1.adminMSP}`;
const ORG2_ADMIN_MSP = `${NETWORK_DIR}${config.orgs.org2.adminMSP}`;

const ORG1_USER_MSP = `${NETWORK_DIR}${config.orgs.org1.userMSP}`;
const ORG2_USER_MSP = `${NETWORK_DIR}${config.orgs.org2.userMSP}`;

export const CHANNEL_1_PATH = `${NETWORK_DIR}${config.channels.mychannel.configPath}`;

export enum Organization {
    ORG1 = 'org1',
    ORG2 = 'org2',
}

export const ORG_LIST = {
    ORG1: Organization.ORG1,
    ORG2: Organization.ORG2,
};

const ADMIN_MSP_DIR = {
    org1: ORG1_ADMIN_MSP,
    org2: ORG2_ADMIN_MSP,
};

const USER_MSP_DIR = {
    org1: ORG1_USER_MSP,
    org2: ORG2_USER_MSP,
};

const MSP_ID = {
    org1: 'Org1MSP',
    org2: 'Org2MSP',
};

export async function getPeers(client: Client, org: Organization): Promise<Peer[]> {
    const peers: Peer[] = [];

    for (let i = 0; i < 2; i++) {
        const ORG = config.orgs[org];

        const tls_cacert = `${NETWORK_DIR}${ORG.peers[i].cacert}`;

        const data = fs.readFileSync(path.join(__dirname, tls_cacert));

        const p = client.newPeer(ORG.peers[i].url, {
            'pem': Buffer.from(data).toString(),
            'ssl-target-name-override': ORG.peers[i].mspid,
        });

        peers[i] = p;
    }

    return peers;
}

export async function getOrderer(client: Client): Promise<Orderer> {
    const data = fs.readFileSync(path.join(__dirname, ORDERER_TLS_CAROOT_PATH));

    const orderer: Orderer = client.newOrderer(ORDERER_URL, {
        'pem': Buffer.from(data).toString(),
        'ssl-target-name-override': config.orderer.mspid,
    });

    return orderer;
}

export async function getClient(org: Organization): Promise<Client> {
    const client = new Client();

    Client.setConfigSetting('request-timeout', 120000);

    const cryptoSuite = Client.newCryptoSuite();
    cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({
        path: `${KEY_STORE_PATH_ADMIN}-${org}`,
    }));

    client.setCryptoSuite(cryptoSuite);

    const store = await Client.newDefaultKeyValueStore({
        path: `${KEY_STORE_PATH_ADMIN}-${org}`,
    });

    client.setStateStore(store);

    const ORG_ADMIN_MSP = ADMIN_MSP_DIR[org];

    const privateKeyFile = fs.readdirSync(__dirname + ORG_ADMIN_MSP + '/keystore')[0];

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

export async function getUserClient(org: Organization): Promise<Client> {
    const client = new Client();

    Client.setConfigSetting('request-timeout', 120000);

    const cryptoSuite = Client.newCryptoSuite();
    cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({
        path: `${KEY_STORE_PATH_ADMIN}-${org}`,
    }));

    client.setCryptoSuite(cryptoSuite);

    const store = await Client.newDefaultKeyValueStore({
        path: `${KEY_STORE_PATH_ADMIN}-${org}`,
    });

    client.setStateStore(store);

    const ORG_USER_MSP = USER_MSP_DIR[org];

    const privateKeyFile = fs.readdirSync(__dirname + ORG_USER_MSP + '/keystore')[0];

    const cryptoContentOrgAdmin: CryptoContent = {
        privateKey: path.join(__dirname, ORG_USER_MSP + '/keystore/' + privateKeyFile),
        signedCert: path.join(__dirname, ORG_USER_MSP + '/signcerts/User1@' + org + '.example.com-cert.pem'),
    };

    await client.createUser({
        username: `${org}-user`,
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
            const ORG = config.orgs[org];

            const tls_cacert = `${NETWORK_DIR}${ORG.peers[i].cacert}`;

            const data = fs.readFileSync(path.join(__dirname, tls_cacert));

            const p = client.newPeer(ORG.peers[i].url, {
                'pem': Buffer.from(data).toString(),
                'ssl-target-name-override': ORG.peers[i].mspid,
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