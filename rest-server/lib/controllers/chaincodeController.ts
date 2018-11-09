import * as mongoose from 'mongoose';
import {ChannelSchema} from '../models/channel/channelModel';
import {ChaincodeInstallSchema} from '../models/chaincode/chaincodeInstallModel';
import {ChaincodeInstantiateSchema} from '../models/chaincode/chaincodeInstantiateModel';
import {Request, Response} from 'express';
import {ORG_LIST, getClient, getPeers, getOrderer, getChannel, getPolicy} from '../services/client';
import promise from '../services/promise';
import * as fs from 'fs';
import * as path from 'path';
import ErrorResponse from "../models/response/ErrorResponse";
import SuccessResponse from "../models/response/Response";

const Channel = mongoose.model('Channel', ChannelSchema);
const ChaincodeInstall = mongoose.model('ChaincodeInstall', ChaincodeInstallSchema);
const ChaincodeInstantiate = mongoose.model('ChaincodeInstantiate', ChaincodeInstantiateSchema);

export class ChaincodeController {
    private response = {};

    public async install(req: Request, res: Response) {
        const chaincodeName = req.body.chaincodeName;
        const channelName = req.body.channelName;
        const orgName = req.body.org;

        let result = await promise(Channel, Channel.findOne, {
            name: channelName,
        });

        if (result.err) {
            this.response = new ErrorResponse({
                type: 'INTERNAL_SERVER_ERROR',
                message: result.err.toString(),
            });

            return res.status(500).json(this.response);
        }

        if (!result.res) {
            this.response = new ErrorResponse({
                code: 404,
                type: 'NOT_FOUND',
                message: 'Channel does not exists',
            });

            return res.status(404).json(this.response);
        }

        result = await promise(ChaincodeInstall, ChaincodeInstall.findOne, {
            chaincodeName: chaincodeName,
            channelName: channelName,
            org: orgName,
        });

        if (result.err) {
            this.response = new ErrorResponse({
                type: 'INTERNAL_SERVER_ERROR',
                message: result.err.toString(),
            });

            return res.status(500).json(this.response);
        }

        if (result.res) {
            this.response = new ErrorResponse({
                code: 403,
                type: 'FORBIDDEN',
                message: 'Chaincode already installed',
            });

            return res.status(403).json(this.response);
        }

        const newChaincodeInstall = new ChaincodeInstall(req.body);

        result = await promise(newChaincodeInstall, newChaincodeInstall.save);

        if (result.err) {
            this.response = new ErrorResponse({
                type: 'INTERNAL_SERVER_ERROR',
                message: result.err.toString(),
            });

            return res.status(500).json(this.response);
        }

        if (!result.res) {
            this.response = new ErrorResponse({
                type: 'INTERNAL_SERVER_ERROR',
            });

            return res.status(500).json(this.response);
        }

        try {
            const client = await getClient(ORG_LIST[orgName]);
            const orderer = await getOrderer(client);

            const channel = client.newChannel(channelName);

            channel.addOrderer(orderer);

            const peers = await getPeers(client, ORG_LIST[orgName]);

            const data = await client.installChaincode({
                targets: peers,
                chaincodeId: chaincodeName,
                chaincodePath: path.join(__dirname, '../../../kafka-network/chaincode/' + chaincodeName),
                chaincodeVersion: 'v0',
                chaincodeType: 'node',
                txId: client.newTransactionID(),
            });

            this.response = new SuccessResponse({data});

            res.json(this.response);
        } catch(err) {
            await promise(ChaincodeInstall, ChaincodeInstall.deleteOne, {
                chaincodeName: chaincodeName,
                channelName: channelName,
                org: orgName,
            });

            this.response = new ErrorResponse({
                type: 'INTERNAL_SERVER_ERROR',
                message: err.toString(),
            });

            return res.status(500).json(this.response);
        }
    }

    public async instantiate(req: Request, res: Response) {
        const chaincodeName = req.body.chaincodeName;
        const channelName = req.body.channelName;
        const orgName = req.body.org;

        let result = await promise(Channel, Channel.findOne, {
            name: channelName,
        });

        if (result.err) {
            this.response = new ErrorResponse({
                type: 'INTERNAL_SERVER_ERROR',
                message: result.err.toString(),
            });

            return res.status(500).json(this.response);
        }

        if (!result.res) {
            this.response = new ErrorResponse({
                code: 404,
                type: 'NOT_FOUND',
                message: 'Channel does not exists',
            });

            return res.status(404).json(this.response);
        }

        result = await promise(ChaincodeInstantiate, ChaincodeInstantiate.findOne, {
            chaincodeName: chaincodeName,
            channelName: channelName,
        });

        if (result.err) {
            this.response = new ErrorResponse({
                type: 'INTERNAL_SERVER_ERROR',
                message: result.err.toString(),
            });

            return res.status(500).json(this.response);
        }

        if (result.res) {
            this.response = new ErrorResponse({
                code: 403,
                type: 'FORBIDDEN',
                message: 'Chaincode already instantiated',
            });

            return res.status(403).json(this.response);
        }

        const newChaincodeInstantiate = new ChaincodeInstantiate(req.body);

        result = await promise(newChaincodeInstantiate, newChaincodeInstantiate.save);

        if (result.err) {
            this.response = new ErrorResponse({
                type: 'INTERNAL_SERVER_ERROR',
                message: result.err.toString(),
            });

            return res.status(500).json(this.response);
        }

        if (!result.res) {
            this.response = new ErrorResponse({
                type: 'INTERNAL_SERVER_ERROR',
            });

            return res.status(500).json(this.response);
        }

        try {
            const client = await getClient(ORG_LIST[orgName]);

            const channel = await getChannel(client, ORG_LIST[orgName], channelName);

            const results = await channel.sendInstantiateProposal({
            //const results = await channel.sendUpgradeProposal({
                chaincodeId: chaincodeName,
                chaincodeVersion: 'v0',
                fcn: 'init',
                args: [],
                txId: client.newTransactionID(),
                'endorsement-policy': getPolicy(),
            });

            const proposalResponses = results[0];
            const proposal = results[1];

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
                proposalResponses: proposalResponses,
                proposal: proposal,
            });

            this.response = new SuccessResponse({data});

            res.json(this.response);
        } catch(err) {
            await promise(ChaincodeInstantiate, ChaincodeInstantiate.deleteOne, {
                chaincodeName: chaincodeName,
                channelName: channelName,
            });

            this.response = new ErrorResponse({
                type: 'INTERNAL_SERVER_ERROR',
                message: err.toString(),
            });

            return res.status(500).json(this.response);
        }
    }
}