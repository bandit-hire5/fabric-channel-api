import {Request, Response} from 'express';
import {ORG_LIST, getClient, getChannel} from '../services/client';
import ErrorResponse from "../models/response/ErrorResponse";
import SuccessResponse from "../models/response/Response";

export class QueryController {
    private response = {};

    public async allCars(req: Request, res: Response) {
        const chaincodeName = req.query.chaincodeName;
        const channelName = req.query.channelName;
        const orgName = ORG_LIST[req.query.org];

        try {
            const client = await getClient(orgName);

            const channel = await getChannel(client, orgName, channelName);

            const response = await channel.queryByChaincode({
                chaincodeId: chaincodeName,
                fcn: 'queryAllCars',
                args: [],
            });

            try {
                let data = JSON.parse(response[0].toString('utf8'));

                this.response = new SuccessResponse({data});

                res.json(this.response);
            } catch(e) {
                throw new Error('');
            }
        } catch(err) {
            this.response = new ErrorResponse({
                type: 'INTERNAL_SERVER_ERROR',
                message: err.toString(),
            });

            return res.status(500).json(this.response);
        }
    }

    public async getCar(req: Request, res: Response) {
        const chaincodeName = req.query.chaincodeName;
        const channelName = req.query.channelName;
        const orgName = ORG_LIST[req.query.org];
        const carNumber = req.query.carNumber;

        try {
            const client = await getClient(orgName);

            const channel = await getChannel(client, orgName, channelName);

            const response = await channel.queryByChaincode({
                chaincodeId: chaincodeName,
                fcn: 'queryCar',
                args: [carNumber],
            });

            try {
                let data = JSON.parse(response[0].toString('utf8'));

                this.response = new SuccessResponse({data});

                res.json(this.response);
            } catch(e) {
                throw new Error('');
            }
        } catch(err) {
            this.response = new ErrorResponse({
                type: 'INTERNAL_SERVER_ERROR',
                message: err.toString(),
            });

            return res.status(500).json(this.response);
        }
    }
}