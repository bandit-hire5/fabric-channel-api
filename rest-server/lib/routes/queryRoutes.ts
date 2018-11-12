import {QueryController} from '../controllers/queryController';
import {validateChannelName, validateOrg, validateChaincodeName, validate} from "../config/middleware";
import * as express from "express";

export class Routes {
    public controller: QueryController = new QueryController();

    public routes(app: express.Application): void {
        app.use('/query/*',
            validateOrg('get'),
            validateChannelName('get'),
            validateChaincodeName('get')
        );

        app.route('/query/allCars')
            .get(
                this.controller.allCars.bind(this.controller)
            );

        app.route('/query/car')
            .get(
                validate('id', 'get'),
                this.controller.getCar.bind(this.controller)
            );
    }
}