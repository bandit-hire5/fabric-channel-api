import {Request, Response, NextFunction} from 'express';
import {ORG_LIST} from '../services/client';
import ErrorResponse from "../models/response/ErrorResponse";
import config from '../config';

export function validate(field, type) {
    const from = type === 'get' ? 'query' : 'body';

    return (req: Request, res: Response, next: NextFunction) => {
        if (!req[from][field]) {
            let response = new ErrorResponse({
                code: 400,
                type: 'BAD_REQUEST',
                message: 'The field "' + field + '" is required',
            });

            return res.status(400).json(response);
        }

        next();
    };
}

export function validateOrg(type) {
    return (req: Request, res: Response, next: NextFunction) => {
        const field = 'org';
        const from = type === 'get' ? 'query' : 'body';

        if (!req[from][field]) {
            let response = new ErrorResponse({
                code: 400,
                type: 'BAD_REQUEST',
                message: 'The field "' + field + '" is required',
            });

            return res.status(400).json(response);
        }

        req[from][field] = req[from][field].toUpperCase();

        if (!ORG_LIST[req[from][field]]) {
            let response = new ErrorResponse({
                code: 400,
                type: 'BAD_REQUEST',
                message: 'The field "' + field + '" is not valid',
            });

            return res.status(400).json(response);
        }

        next();
    };
}

export function validateChannelName(type) {
    return (req: Request, res: Response, next: NextFunction) => {
        const field = 'channelName';
        const from = type === 'get' ? 'query' : 'body';

        if (!req[from][field]) {
            let response = new ErrorResponse({
                code: 400,
                type: 'BAD_REQUEST',
                message: 'The field "' + field + '" is required',
            });

            return res.status(400).json(response);
        }

        if (config.allowedChannelList.indexOf(req[from][field]) === -1) {
            let response = new ErrorResponse({
                code: 400,
                type: 'BAD_REQUEST',
                message: 'The field "' + field + '" is not valid',
            });

            return res.status(400).json(response);
        }

        next();
    };
}

export function validateChaincodeName(type) {
    return (req: Request, res: Response, next: NextFunction) => {
        const field = 'chaincodeName';
        const from = type === 'get' ? 'query' : 'body';

        if (!req[from][field]) {
            let response = new ErrorResponse({
                code: 400,
                type: 'BAD_REQUEST',
                message: 'The field "' + field + '" is required',
            });

            return res.status(400).json(response);
        }

        if (config.allowedChaincodeList.indexOf(req.query.chaincodeName) === -1) {
            let response = new ErrorResponse({
                code: 400,
                type: 'BAD_REQUEST',
                message: 'Not allowed chaincode',
            });

            return res.status(400).json(response);
        }

        next();
    };
}