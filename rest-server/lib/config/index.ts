export default {
    db: process.env.MONGODB_URL,
    orgs: {
        org1: {
            peers: [
                {
                    url: 'grpcs://localhost:7051', // peer0
                    mspid: 'peer0.org1.example.com',
                    cacert: '/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt',
                },
                {
                    url: 'grpcs://localhost:8051', // peer1
                    mspid: 'peer1.org1.example.com',
                    cacert: '/crypto-config/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/tls/ca.crt',
                },
            ],
            adminMSP: '/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp',
        },
        org2: {
            peers: [
                {
                    url: 'grpcs://localhost:9051', // peer0
                    mspid: 'peer0.org2.example.com',
                    cacert: '/crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt',
                },
                {
                    url: 'grpcs://localhost:10051', // peer1
                    mspid: 'peer1.org2.example.com',
                    cacert: '/crypto-config/peerOrganizations/org2.example.com/peers/peer1.org2.example.com/tls/ca.crt',
                },
            ],
            adminMSP: '/crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp',
        },
    },
    orderer: {
        url: 'grpcs://localhost:7050',
        mspid: 'orderer.example.com',
        cacert: '/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt',
    },
    'endorsement-policy': {
        identities: [
            { role: { name: "member", mspId: "Org1MSP" }},
            { role: { name: "member", mspId: "Org2MSP" }},
        ],
        policy: {
            "1-of": [{ "signed-by": 0 }, { "signed-by": 1 }]
        }
    },
    channels: {
        mychannel: {
            configPath: '/channel-artifacts/channel.tx',
        }
    },
    allowedChannelList: [
        'mychannel',
    ],
    allowedChaincodeList: [
        'fabcar',
    ],
};