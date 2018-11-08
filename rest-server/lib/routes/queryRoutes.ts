import {Request, Response, NextFunction} from 'express';
import {ALLOWED_CHAINCODE_LEST, ALLOWED_CHANNEL_LEST, ORG_LIST} from '../services/client';
import {QueryController} from '../controllers/queryController';
import ErrorResponse from "../models/response/ErrorResponse";

export class Routes {
    public queryController: QueryController = new QueryController();

    public routes(app: any): void {
        app.use('/query/allCars', (req: Request, res: Response, next: NextFunction) => {
            if (!req.query.chaincodeName) {
                let response = new ErrorResponse({
                    code: 400,
                    type: 'BAD_REQUEST',
                    message: 'The field chaincodeName is required',
                });

                return res.status(400).json(response);
            }

            if (ALLOWED_CHAINCODE_LEST.indexOf(req.query.chaincodeName) === -1) {
                let response = new ErrorResponse({
                    code: 400,
                    type: 'BAD_REQUEST',
                    message: 'Not allowed chaincode',
                });

                return res.status(400).json(response);
            }

            if (!req.query.channelName) {
                let response = new ErrorResponse({
                    code: 400,
                    type: 'BAD_REQUEST',
                    message: 'The field channelName is required',
                });

                return res.status(400).json(response);
            }

            if (ALLOWED_CHANNEL_LEST.indexOf(req.query.channelName) === -1) {
                let response = new ErrorResponse({
                    code: 400,
                    type: 'BAD_REQUEST',
                    message: 'Not allowed channel name',
                });

                return res.status(400).json(response);
            }

            if (!req.query.org) {
                req.query.org = 'ORG1';
            } else {
                req.query.org = req.query.org.toUpperCase();

                if (!ORG_LIST[req.query.org]) {
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

        app.route('/query/allCars')
            .get(this.queryController.allCars.bind(this.queryController));
    }
}