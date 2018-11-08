import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const ChaincodeInstantiateSchema = new Schema({
    chaincodeName: {
        type: String,
        required: 'Enter a chaincode name'
    },
    channelName: {
        type: String,
        required: 'Enter a channel name'
    },
});