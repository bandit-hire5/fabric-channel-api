import * as express from 'express';
import * as bodyParser from 'body-parser';
import {Routes} from './routes';
import * as mongoose from 'mongoose';

class App {
    public app: express.Application;
    public routes: Routes = new Routes();
    public mongoUrl: string = 'mongodb://127.0.0.1:27017/exampledb';

    constructor() {
        this.app = express();
        this.config();
        this.routes.init(this.app);
        this.mongoSetup();
    }

    private config(): void {
        // support application/json type post data
        this.app.use(bodyParser.json());

        //support application/x-www-form-urlencoded post data
        this.app.use(bodyParser.urlencoded({
            extended: false,
        }));
    }

    private mongoSetup(): void {
        (<any>mongoose).Promise = global.Promise;
        mongoose.connect(this.mongoUrl, {
            useNewUrlParser: true,
        });

        /*mongoose.connection.collections['channels'].drop( function(err) {
            console.log('collection dropped Channel');
        });

        mongoose.connection.collections['joins'].drop( function(err) {
            console.log('collection dropped Joins');
        });

        mongoose.connection.collections['chaincodeinstalls'].drop( function(err) {
            console.log('collection dropped ChaincodeInstall');
        });

        mongoose.connection.collections['chaincodeinstantiates'].drop( function(err) {
            console.log('collection dropped ChaincodeInstantiate');
        });*/
    }
}

export default new App().app;