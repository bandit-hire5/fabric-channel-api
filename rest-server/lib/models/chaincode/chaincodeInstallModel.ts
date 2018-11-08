import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const ChaincodeInstallSchema = new Schema({
    chaincodeName: {
        type: String,
        required: 'Enter a chaincode name'
    },
    channelName: {
        type: String,
        required: 'Enter a channel name'
    },
    org: {
        type: String,
        required: 'Enter a org name'
    },
});