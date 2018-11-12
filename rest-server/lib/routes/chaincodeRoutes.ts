import * as express from "express";
import {ChaincodeController} from '../controllers/chaincodeController';
import {validateOrg, validateChannelName, validateChaincodeName} from '../config/middleware';

export class Routes {
    public controller: ChaincodeController = new ChaincodeController();

    public routes(app: express.Application): void {
        app.use('/channels', validateOrg('any'), validateChannelName('any'), validateChaincodeName('any'));

        app.route('/chaincode')
            .post(
                this.controller.install.bind(this.controller)
            )
            .put(
                this.controller.instantiate.bind(this.controller)
            );
    }
}