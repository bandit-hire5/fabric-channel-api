import * as mongoose from 'mongoose';
import {ChannelSchema} from '../models/channelModel';
import {Request, Response} from 'express';
import {ORG_LIST, getClient, getOrderer} from '../services/client';
import promise from '../services/promise';

const Channel = mongoose.model('Channel', ChannelSchema);
export class ChannelController {
    public async createChannel(req: Request, res: Response) {
        let newChannel = new Channel(req.body);

        let result = await promise(Channel, Channel.findOne, {name: req.body.name});

        if (result.err) {
            res.send(result.err);
        }

        if (result.res) {
            res.send('Channel already exists');
        }

        result = await promise(newChannel, newChannel.save);

        if (result.err) {
            res.send(result.err);
        }

        if (!result.res) {
            res.send('Error save channel to DB');
        }

        /*const orgClient = await getClient(ORG_LIST[req.body.org]);
        const orderer = await getOrderer(orgClient);

        res.json('OK');*/
    }
}