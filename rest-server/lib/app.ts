import * as express from 'express';
import {Routes} from './routes';
import * as mongoose from 'mongoose';
import config from './config';
import ExpressConfig from './config/express';

class App {
    public app: express.Application;
    public routes: Routes;
    public expressConfig: ExpressConfig;

    constructor() {
        this.app = express();
        this.routes = new Routes();
        this.expressConfig = new ExpressConfig();
    }

    public init(): void {
        this.config();
        this.routes.init(this.app);
        this.connect();

        mongoose.connection
            .on('error', console.log)
            .on('disconnected', this.connect.bind(this))
            .once('open', this.listen.bind(this));
    }

    public listen(): void {
        const PORT = process.env.PORT || 3000;

        this.app.listen(PORT, () => {
            console.log('Express server listening on port ' + PORT);
        });
    }

    private config(): void {
        this.expressConfig.init(this.app);
    }

    private connect(): void {
        const options = {
            useNewUrlParser: true,
        };

        mongoose.connect(config.db, options);
    }
}

export default new App();