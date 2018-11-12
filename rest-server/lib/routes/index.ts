import {Routes as ChannelRoutes} from "./channelRoutes";
import {Routes as ChaincodeRoutes} from "./chaincodeRoutes";
import {Routes as QueryRoutes} from "./queryRoutes";
import {Routes as InvokeRoutes} from "./invokeRoutes";
import {Routes as DbRoutes} from "./dbRoutes";
import * as express from "express";

export class Routes {
    public routeChannel: ChannelRoutes = new ChannelRoutes();
    public routeChaincode: ChaincodeRoutes = new ChaincodeRoutes();
    public routeQuery: QueryRoutes = new QueryRoutes();
    public routeInvoke: InvokeRoutes = new InvokeRoutes();
    public dbInvoke: DbRoutes = new DbRoutes();

    public init(app: express.Application): void {
        this.routeChannel.routes(app);
        this.routeChaincode.routes(app);
        this.routeQuery.routes(app);
        this.routeInvoke.routes(app);
        this.dbInvoke.routes(app);
    }
}