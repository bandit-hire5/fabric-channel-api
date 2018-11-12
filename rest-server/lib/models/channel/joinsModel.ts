import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const JoinsSchema = new Schema({
    channelName: {
        type: String,
        required: 'Enter a channel name',
    },
    org: {
        type: String,
        required: 'Enter a org name',
    },
});