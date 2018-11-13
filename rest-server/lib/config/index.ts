export default {
    db: process.env.MONGODB_URL,
    orgs: {
        org1: {
            peers: [
                {
                    url: 'grpcs://localhost:7051', // peer0
                    mspid: 'peer0.org1.example.com',
                    //cacert: '/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt',
                    cacert: '/crypto-config/peerOrganizations/org1.example.com/msp/tlscacerts/tlsca.org1.example.com-cert.pem',
                },
                {
                    url: 'grpcs://localhost:8051', // peer1
                    mspid: 'peer1.org1.example.com',
                    //cacert: '/crypto-config/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/tls/ca.crt',
                    cacert: '/crypto-config/peerOrganizations/org1.example.com/msp/tlscacerts/tlsca.org1.example.com-cert.pem',
                },
            ],
            adminMSP: '/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp',
            enrollmentID: 'admin1',
            enrollmentSecret: '12345678',
            userMSP: '/crypto-config/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp',
            ca: {
                url: 'https://localhost:7054',
                mspid: 'ca1.example.com',
            },
        },
        org2: {
            peers: [
                {
                    url: 'grpcs://localhost:9051', // peer0
                    mspid: 'peer0.org2.example.com',
                    //cacert: '/crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt',
                    cacert: '/crypto-config/peerOrganizations/org2.example.com/msp/tlscacerts/tlsca.org2.example.com-cert.pem',
                },
                {
                    url: 'grpcs://localhost:10051', // peer1
                    mspid: 'peer1.org2.example.com',
                    //cacert: '/crypto-config/peerOrganizations/org2.example.com/peers/peer1.org2.example.com/tls/ca.crt',
                    cacert: '/crypto-config/peerOrganizations/org2.example.com/msp/tlscacerts/tlsca.org2.example.com-cert.pem',
                },
            ],
            adminMSP: '/crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp',
            enrollmentID: 'admin21',
            enrollmentSecret: '87654321',
            userMSP: '/crypto-config/peerOrganizations/org2.example.com/users/User1@org2.example.com/msp',
            ca: {
                url: 'https://localhost:8054',
                mspid: 'ca2.example.com',
            },
        },
    },
    orderer: {
        url: 'grpcs://localhost:7050',
        mspid: 'orderer.example.com',
        //cacert: '/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt',
        cacert: '/crypto-config/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem',
    },
    'endorsement-policy': {
        identities: [
            { role: { name: "peer", mspId: "Org1MSP" }},
            { role: { name: "peer", mspId: "Org2MSP" }},
        ],
        policy: {
            "2-of": [{ "signed-by": 0 }, { "signed-by": 1 }]
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