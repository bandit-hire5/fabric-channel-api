import {Request, Response, NextFunction} from 'express';
import {ALLOWED_CHANNEL_LEST, ORG_LIST} from '../services/client';
import {ChannelController} from '../controllers/channelController';
import ErrorResponse from "../models/response/ErrorResponse";

export class Routes {
    public channelController: ChannelController = new ChannelController();

    public routes(app: any): void {
        app.use('/channels', (req: Request, res: Response, next: NextFunction) => {
            if (!req.body.org) {
                req.body.org = 'ORG1';
            } else {
                req.body.org = req.body.org.toUpperCase();

                if (!ORG_LIST[req.body.org]) {
                    let response = new ErrorResponse({
                        code: 400,
                        type: 'BAD_REQUEST',
                        message: 'The field org is not valid',
                    });

                    return res.status(400).json(response);
                }
            }

            next();
        });

        app.route('/channels')
            .post((req: Request, res: Response, next: NextFunction) => {
                if (!req.body.name) {
                    let response = new ErrorResponse({
                        code: 400,
                        type: 'BAD_REQUEST',
                        message: 'The field name is required',
                    });

                    return res.status(400).json(response);
                }

                if (ALLOWED_CHANNEL_LEST.indexOf(req.body.name) === -1) {
                    let response = new ErrorResponse({
                        code: 400,
                        type: 'BAD_REQUEST',
                        message: 'Not allowed channel name',
                    });

                    return res.status(400).json(response);
                }

                next();
            }, this.channelController.create.bind(this.channelController))
            .put((req: Request, res: Response, next: NextFunction) => {
                if (!req.body.channelName) {
                    let response = new ErrorResponse({
                        code: 400,
                        type: 'BAD_REQUEST',
                        message: 'The field channelName is required',
                    });

                    return res.status(400).json(response);
                }

                if (ALLOWED_CHANNEL_LEST.indexOf(req.body.channelName) === -1) {
                    let response = new ErrorResponse({
                        code: 400,
                        type: 'BAD_REQUEST',
                        message: 'Not allowed channelName',
                    });

                    return res.status(400).json(response);
                }

                next();
            }, this.channelController.join.bind(this.channelController));
    }
}