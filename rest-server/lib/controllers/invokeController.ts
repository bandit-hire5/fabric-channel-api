import {Request, Response} from 'express';
import {ORG_LIST, getUser, getChannel} from '../services/client';
import {error, response} from "../helpers/response";

export class InvokeController {
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
            org,
        } = req.body;

        try {
            const client = await getUser(ORG_LIST[org]);

            const channel = await getChannel(client, ORG_LIST[org], channelName);

            const tx_id = client.newTransactionID();

            const results = await channel.sendTransactionProposal({
                chaincodeId: chaincodeName,
                fcn: this.fn,
                args: this.args,
                txId: tx_id,
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

            const request = {
                proposalResponses,
                proposal,
            };

            const transaction_id_string = tx_id.getTransactionID();
            const promises = [];

            const sendPromise = channel.sendTransaction(request);
            promises.push(sendPromise);

            let event_hub = channel.newChannelEventHub(channel.getPeers()[0].getName());

            let txPromise = new Promise((resolve, reject) => {
                let handle = setTimeout(() => {
                    event_hub.disconnect();
                    resolve({
                        event_status: 'TIMEOUT',
                    });
                }, 3000);

                event_hub.connect();

                event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
                    clearTimeout(handle);

                    event_hub.unregisterTxEvent(transaction_id_string);
                    event_hub.disconnect();

                    const return_status = {
                        event_status : code,
                        tx_id : transaction_id_string,
                    };

                    resolve(return_status);
                }, (err) => {
                    reject(new Error('There was a problem with the eventhub ::' + err));
                });
            });

            promises.push(txPromise);

            const data = await Promise.all(promises);

            return response(res, data);
        } catch(err) {
            return error(res, 500, 'INTERNAL_SERVER_ERROR', err.toString());
        }
    }
}