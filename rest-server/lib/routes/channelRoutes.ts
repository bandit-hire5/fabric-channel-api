import * as express from "express";
import {ChannelController} from '../controllers/channelController';
import {validateOrg, validateChannelName} from '../config/middleware';

export class Routes {
    public controller: ChannelController = new ChannelController();

    public routes(app: express.Application): void {
        app.use('/channels', validateOrg('any'), validateChannelName('any'));

        app.route('/channels')
            .post(
                this.controller.create.bind(this.controller)
            )
            .put(
                this.controller.join.bind(this.controller)
            );
    }
}