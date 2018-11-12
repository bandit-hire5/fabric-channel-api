import * as mongoose from 'mongoose';
import {ChannelSchema} from '../models/channel/channelModel';
import {ChaincodeInstallSchema} from '../models/chaincode/chaincodeInstallModel';
import {ChaincodeInstantiateSchema} from '../models/chaincode/chaincodeInstantiateModel';
import {Request, Response} from 'express';
import {ORG_LIST, getClient, getPeers, getOrderer, getChannel} from '../services/client';
import promise from '../services/promise';
import * as path from 'path';
import {error, response} from "../helpers/response";
import config from '../config';

const Channel = mongoose.model('Channel', ChannelSchema);
const ChaincodeInstall = mongoose.model('ChaincodeInstall', ChaincodeInstallSchema);
const ChaincodeInstantiate = mongoose.model('ChaincodeInstantiate', ChaincodeInstantiateSchema);

export class ChaincodeController {
    public async install(req: Request, res: Response) {
        const {chaincodeName, channelName, org} = req.body;

        try {
            let result = await promise(Channel, Channel.findOne, {channelName});

            if (!result.res) {
                return error(res, 404, 'NOT_FOUND', 'Channel does not exists');
            }

            result = await promise(ChaincodeInstall, ChaincodeInstall.findOne, {
                chaincodeName,
                channelName,
                org,
            });

            if (result.res) {
                return error(res, 403, 'FORBIDDEN', 'Chaincode already installed');
            }

            const newChaincodeInstall = new ChaincodeInstall(req.body);

            result = await promise(newChaincodeInstall, newChaincodeInstall.save);

            if (!result.res) {
                return error(res, 500, 'INTERNAL_SERVER_ERROR');
            }

            const client = await getClient(ORG_LIST[org]);
            const orderer = await getOrderer(client);

            const channel = client.newChannel(channelName);

            channel.addOrderer(orderer);

            const peers = await getPeers(client, ORG_LIST[org]);

            const data = await client.installChaincode({
                targets: peers,
                chaincodeId: chaincodeName,
                chaincodePath: path.join(__dirname, '../../../kafka-network/chaincode/' + chaincodeName),
                chaincodeVersion: 'v0',
                chaincodeType: 'node',
                txId: client.newTransactionID(),
            });

            return response(res, data);
        } catch(err) {
            await promise(ChaincodeInstall, ChaincodeInstall.deleteOne, {
                chaincodeName,
                channelName,
                org,
            });

            return error(res, 500, 'INTERNAL_SERVER_ERROR', err.toString());
        }
    }

    public async instantiate(req: Request, res: Response) {
        const {chaincodeName, channelName, org} = req.body;

        try {
            let result = await promise(Channel, Channel.findOne, {channelName});

            if (!result.res) {
                return error(res, 404, 'NOT_FOUND', 'Channel does not exists');
            }

            result = await promise(ChaincodeInstantiate, ChaincodeInstantiate.findOne, {
                chaincodeName,
                channelName,
            });

            if (result.res) {
                return error(res, 403, 'FORBIDDEN', 'Chaincode already instantiated');
            }

            const newChaincodeInstantiate = new ChaincodeInstantiate(req.body);

            result = await promise(newChaincodeInstantiate, newChaincodeInstantiate.save);

            if (!result.res) {
                return error(res, 500, 'INTERNAL_SERVER_ERROR');
            }

            const client = await getClient(ORG_LIST[org]);
            const channel = await getChannel(client, ORG_LIST[org], channelName);

            const results = await channel.sendInstantiateProposal({
            //const results = await channel.sendUpgradeProposal({
                chaincodeId: chaincodeName,
                chaincodeVersion: 'v0',
                fcn: 'init',
                args: [],
                txId: client.newTransactionID(),
                'endorsement-policy': config['endorsement-policy'],
            });

            const [proposalResponses, proposal] = results;

            let all_good = true;

            for (let i in proposalResponses) {
                let one_good = false;

                if (proposalResponses[i].response && proposalResponses[i].response.status === 200) {
                    one_good = true;
                }

                all_good = all_good && one_good;
            }

            if (!all_good) {
                throw new Error('Failed to send Instantiate Proposal or receive valid response. Response null or status is not 200. exiting...');
            }

            const data = await channel.sendTransaction({
                proposalResponses,
                proposal,
            });

            return response(res, data);
        } catch(err) {
            await promise(ChaincodeInstantiate, ChaincodeInstantiate.deleteOne, {
                chaincodeName,
                channelName,
            });

            return error(res, 500, 'INTERNAL_SERVER_ERROR', err.toString());
        }
    }
}