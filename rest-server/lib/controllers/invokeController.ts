import {Request, Response} from 'express';
import {ORG_LIST, getClient, getChannel, getPolicy} from '../services/client';
import ErrorResponse from "../models/response/ErrorResponse";
import SuccessResponse from "../models/response/Response";

export class InvokeController {
    private response = {};
    private fn: string = '';
    private args: string[] = [];

    public async createCar(req: Request, res: Response) {
        const {
            id,
            make,
            model,
            color,
            owner
        } = req.body;

        this.fn = 'createCar';
        this.args = [id, make, model, color, owner];

        return await this.sendProposal(req, res);
    }

    public async changeCarOwner(req: Request, res: Response) {
        const {
            id,
            owner
        } = req.body;

        this.fn = 'changeCarOwner';
        this.args = [id, owner];

        return await this.sendProposal(req, res);
    }

    private async sendProposal(req: Request, res: Response) {
        const {
            chaincodeName,
            channelName,
        } = req.body;

        try {
            const client = await getClient(ORG_LIST[req.body.org]);

            const channel = await getChannel(client, ORG_LIST[req.body.org], channelName);

            const results = await channel.sendTransactionProposal({
                chaincodeId: chaincodeName,
                fcn: this.fn,
                args: this.args,
                txId: client.newTransactionID(),
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
                throw new Error('Failed to send createCar Proposal or receive valid response. Response null or status is not 200. exiting...');
            }

            const data = await channel.sendTransaction({
                proposalResponses: proposalResponses,
                proposal: proposal,
            });

            this.response = new SuccessResponse({data});

            res.json(this.response);
        } catch(err) {
            this.response = new ErrorResponse({
                type: 'INTERNAL_SERVER_ERROR',
                message: err.toString(),
            });

            return res.status(500).json(this.response);
        }
    }
}