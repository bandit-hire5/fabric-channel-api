import {Request, Response, NextFunction} from 'express';
import {ORG_LIST} from '../services/client';
import {ChannelController} from '../controllers/channelController';

export class Routes {
    public channelController: ChannelController = new ChannelController();

    public routes(app: any): void {
        app.route('/channels')
            .post((req: Request, res: Response, next: NextFunction) => {
                if (!req.body.name) {
                    res.status(500).send('The field name is required');
                }

                if (!req.body.org) {
                    req.body.org = 'ORG1';
                } else {
                    req.body.org = req.body.org.toUpperCase();

                    if (!ORG_LIST[req.body.org]) {
                        res.status(500).send('The field org is not valid');
                    }
                }

                next();
            }, this.channelController.createChannel);
    }
}