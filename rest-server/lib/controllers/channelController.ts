import * as mongoose from 'mongoose';
import {ChannelSchema} from '../models/channel/channelModel';
import {JoinsSchema} from '../models/channel/joinsModel';
import {Request, Response} from 'express';
import {ORG_LIST, getClient, getPeers, getOrderer, CHANNEL_1_PATH} from '../services/client';
import promise from '../services/promise';
import * as fs from 'fs';
import * as path from 'path';
import {ChannelRequest} from "fabric-client";
import ErrorResponse from "../models/response/ErrorResponse";
import SuccessResponse from "../models/response/Response";

const Channel = mongoose.model('Channel', ChannelSchema);
const Joins = mongoose.model('Joins', JoinsSchema);

export class ChannelController {
    private response = {};
    
    public async create(req: Request, res: Response) {
        const channelName = req.body.name;
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

        if (result.res) {
            this.response = new ErrorResponse({
                code: 403,
                type: 'FORBIDDEN',
                message: 'Channel already exists',
            });

            return res.status(403).json(this.response);
        }

        const newChannel = new Channel(req.body);

        result = await promise(newChannel, newChannel.save);

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
            const client = await getClient(ORG_LIST[req.body.org]);
            const orderer = await getOrderer(client);

            const envelope = fs.readFileSync(path.join(__dirname, CHANNEL_1_PATH));
            const channelConfig = client.extractChannelConfig(envelope);
            const signature = client.signChannelConfig(channelConfig);

            const channelRequest: ChannelRequest = {
                name: channelName,
                config: channelConfig,
                signatures: [signature],
                orderer: orderer,
                txId: client.newTransactionID(),
            };

            const data = await client.createChannel(channelRequest);

            this.response = new SuccessResponse({data});

            res.json(this.response);
        } catch(err) {
            await promise(Channel, Channel.deleteOne, {
                name: channelName,
            });

            this.response = new ErrorResponse({
                type: 'INTERNAL_SERVER_ERROR',
                message: err.toString(),
            });

            return res.status(500).json(this.response);
        }
    }

    public async join(req: Request, res: Response) {
        const channelName = req.body.channelName;

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

        result = await promise(Joins, Joins.findOne, {
            channelName: channelName,
            org: req.body.org,
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
                message: 'Joins already exists',
            });

            return res.status(403).json(this.response);
        }

        const newJoins = new Joins(req.body);

        result = await promise(newJoins, newJoins.save);

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
            const client = await getClient(ORG_LIST[req.body.org]);
            const orderer = await getOrderer(client);

            const channel = client.newChannel(channelName);

            channel.addOrderer(orderer);

            const genesis_block = await channel.getGenesisBlock({
                txId: client.newTransactionID(),
            });

            const peers = await getPeers(client, ORG_LIST[req.body.org]);

            const data = await channel.joinChannel({
                txId: client.newTransactionID(),
                block: genesis_block,
                targets: peers,
            });

            this.response = new SuccessResponse({data});

            res.json(this.response);
        } catch(err) {
            await promise(Joins, Joins.deleteOne, {
                channelName: channelName,
                org: req.body.org,
            });

            this.response = new ErrorResponse({
                type: 'INTERNAL_SERVER_ERROR',
                message: err.toString(),
            });

            return res.status(500).json(this.response);
        }
    }
}