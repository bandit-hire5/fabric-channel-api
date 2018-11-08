import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const ChannelSchema = new Schema({
    name: {
        type: String,
        required: 'Enter a channel name'
    },
});