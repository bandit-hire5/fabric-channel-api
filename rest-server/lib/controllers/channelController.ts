import * as mongoose from 'mongoose';
import {ChannelSchema} from '../models/channel/channelModel';
import {JoinsSchema} from '../models/channel/joinsModel';
import {Request, Response} from 'express';
import {ORG_LIST, getClient, getPeers, getOrderer, CHANNEL_1_PATH} from '../services/client';
import promise from '../services/promise';
import * as fs from 'fs';
import * as path from 'path';
import {ChannelRequest} from "fabric-client";
import {error, response} from "../helpers/response";

const Channel = mongoose.model('Channel', ChannelSchema);
const Joins = mongoose.model('Joins', JoinsSchema);

export class ChannelController {
    public async create(req: Request, res: Response) {
        const {channelName, org} = req.body;

        try {
            let result = await promise(Channel, Channel.findOne, {channelName});

            if (result.res) {
                return error(res, 403, 'FORBIDDEN', 'Channel already exists');
            }

            const newChannel = new Channel(req.body);

            result = await promise(newChannel, newChannel.save);

            if (!result.res) {
                return error(res, 500, 'INTERNAL_SERVER_ERROR');
            }

            const client = await getClient(ORG_LIST[org]);
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

            return response(res, data);
        } catch(err) {
            await promise(Channel, Channel.deleteOne, {channelName});

            return error(res, 500, 'INTERNAL_SERVER_ERROR', err.toString());
        }
    }

    public async join(req: Request, res: Response) {
        const {channelName, org} = req.body;

        try {
            let result = await promise(Channel, Channel.findOne, {channelName});

            if (!result.res) {
                return error(res, 404, 'NOT_FOUND', 'Channel does not exists');
            }

            result = await promise(Joins, Joins.findOne, {
                channelName,
                org,
            });

            if (result.res) {
                return error(res, 403, 'FORBIDDEN', 'Joins already exists');
            }

            const newJoins = new Joins(req.body);

            result = await promise(newJoins, newJoins.save);

            if (!result.res) {
                return error(res, 500, 'INTERNAL_SERVER_ERROR');
            }

            const client = await getClient(ORG_LIST[org]);
            const orderer = await getOrderer(client);

            const channel = client.newChannel(channelName);

            channel.addOrderer(orderer);

            const genesis_block = await channel.getGenesisBlock({
                txId: client.newTransactionID(),
            });

            const peers = await getPeers(client, ORG_LIST[org]);

            const data = await channel.joinChannel({
                txId: client.newTransactionID(),
                block: genesis_block,
                targets: peers,
            });

            return response(res, data);
        } catch(err) {
            await promise(Joins, Joins.deleteOne, {
                channelName,
                org,
            });

            return error(res, 500, 'INTERNAL_SERVER_ERROR', err.toString());
        }
    }
}