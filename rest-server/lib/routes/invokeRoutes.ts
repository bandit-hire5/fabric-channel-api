import {InvokeController} from '../controllers/invokeController';
import {validateChaincodeName, validateChannelName, validateOrg, validate} from "../config/middleware";

export class Routes {
    public controller: InvokeController = new InvokeController();

    public routes(app: any): void {
        app.use('/invoke/*',
            validateOrg('any'),
            validateChannelName('any'),
            validateChaincodeName('any')
        );

        app.route('/invoke/createCar')
            .post(
                validate('id', 'post'),
                validate('make', 'post'),
                validate('model', 'post'),
                validate('color', 'post'),
                validate('owner', 'post'),
                this.controller.createCar.bind(this.controller)
            );

        app.route('/invoke/changeCarOwner')
            .post(
                validate('id', 'post'),
                validate('owner', 'post'),
                this.controller.changeCarOwner.bind(this.controller)
            );
    }
}