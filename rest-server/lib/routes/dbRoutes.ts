import {Request, Response} from 'express';
import * as mongoose from 'mongoose';

export class Routes {
    public routes(app: any): void {
        app.route('/db/clear')
            .get((req: Request, res: Response) => {
                mongoose.connection.db.listCollections().toArray((err, collections) => {
                    if (err) {
                        return res.status(500).json(err);
                    }

                    collections.forEach((e) => {
                        mongoose.connection.db.dropCollection(e.name);
                    });

                    res.send('OK');
                });
            });
    }
}