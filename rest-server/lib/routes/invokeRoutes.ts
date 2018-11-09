import {Request, Response, NextFunction} from 'express';
import {ALLOWED_CHAINCODE_LEST, ALLOWED_CHANNEL_LEST, ORG_LIST} from '../services/client';
import {InvokeController} from '../controllers/invokeController';
import ErrorResponse from "../models/response/ErrorResponse";

export class Routes {
    public invokeController: InvokeController = new InvokeController();

    public routes(app: any): void {
        app.use('/invoke/*', (req: Request, res: Response, next: NextFunction) => {
            if (!req.body.chaincodeName) {
                let response = new ErrorResponse({
                    code: 400,
                    type: 'BAD_REQUEST',
                    message: 'The field chaincodeName is required',
                });

                return res.status(400).json(response);
            }

            if (ALLOWED_CHAINCODE_LEST.indexOf(req.body.chaincodeName) === -1) {
                let response = new ErrorResponse({
                    code: 400,
                    type: 'BAD_REQUEST',
                    message: 'Not allowed chaincode',
                });

                return res.status(400).json(response);
            }

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
                    message: 'Not allowed channel name',
                });

                return res.status(400).json(response);
            }

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

        app.route('/invoke/createCar')
            .post((req: Request, res: Response, next: NextFunction) => {
                if (!req.body.id) {
                    let response = new ErrorResponse({
                        code: 400,
                        type: 'BAD_REQUEST',
                        message: 'The field id is required',
                    });

                    return res.status(400).json(response);
                }

                if (!req.body.make) {
                    let response = new ErrorResponse({
                        code: 400,
                        type: 'BAD_REQUEST',
                        message: 'The field make is required',
                    });

                    return res.status(400).json(response);
                }

                if (!req.body.model) {
                    let response = new ErrorResponse({
                        code: 400,
                        type: 'BAD_REQUEST',
                        message: 'The field model is required',
                    });

                    return res.status(400).json(response);
                }

                if (!req.body.color) {
                    let response = new ErrorResponse({
                        code: 400,
                        type: 'BAD_REQUEST',
                        message: 'The field color is required',
                    });

                    return res.status(400).json(response);
                }

                if (!req.body.owner) {
                    let response = new ErrorResponse({
                        code: 400,
                        type: 'BAD_REQUEST',
                        message: 'The field owner is required',
                    });

                    return res.status(400).json(response);
                }

                next();
            }, this.invokeController.createCar.bind(this.invokeController));

        app.route('/invoke/changeCarOwner')
            .post((req: Request, res: Response, next: NextFunction) => {
                if (!req.body.id) {
                    let response = new ErrorResponse({
                        code: 400,
                        type: 'BAD_REQUEST',
                        message: 'The field id is required',
                    });

                    return res.status(400).json(response);
                }

                if (!req.body.owner) {
                    let response = new ErrorResponse({
                        code: 400,
                        type: 'BAD_REQUEST',
                        message: 'The field owner is required',
                    });

                    return res.status(400).json(response);
                }

                next();
            }, this.invokeController.changeCarOwner.bind(this.invokeController));
    }
}