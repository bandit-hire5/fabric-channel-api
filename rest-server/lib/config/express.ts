import * as express from "express";
import * as bodyParser from 'body-parser';

export default class ExpressConfig {
    public init(app: express.Application): void {
        app.use(bodyParser.json());

        app.use(bodyParser.urlencoded({
            extended: false,
        }));
    }
}