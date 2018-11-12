import {Request, Response} from 'express';
import {getUserClient, getChannel, ORG_LIST} from '../services/client';
import {error, response} from "../helpers/response";

export class QueryController {
    public async allCars(req: Request, res: Response) {
        const {chaincodeName, channelName, org} = req.query;

        try {
            const client = await getUserClient(ORG_LIST[org]);

            const channel = await getChannel(client, org, channelName);

            const results = await channel.queryByChaincode({
                chaincodeId: chaincodeName,
                fcn: 'queryAllCars',
                args: [],
            });

            try {
                let data = JSON.parse(results[0].toString('utf8'));

                return response(res, data);
            } catch(e) {
                throw new Error('Failed to get query result');
            }
        } catch(err) {
            return error(res, 500, 'INTERNAL_SERVER_ERROR', err.toString());
        }
    }

    public async getCar(req: Request, res: Response) {
        const {chaincodeName, channelName, org, id} = req.query;

        try {
            const client = await getUserClient(ORG_LIST[org]);

            const channel = await getChannel(client, org, channelName);

            const results = await channel.queryByChaincode({
                chaincodeId: chaincodeName,
                fcn: 'queryCar',
                args: [id],
            });

            try {
                let data = JSON.parse(results[0].toString('utf8'));

                return response(res, data);
            } catch(e) {
                throw new Error('Failed to get query result');
            }
        } catch(err) {
            return error(res, 500, 'INTERNAL_SERVER_ERROR', err.toString());
        }
    }
}