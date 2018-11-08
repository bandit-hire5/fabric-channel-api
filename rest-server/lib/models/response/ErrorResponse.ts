import {STATUS_CODES} from 'http';
import Response from './Response';

export default class ErrorResponse extends Response {
    constructor(properties: any = {}) {
        let {code, type, message} = properties;

        code = code || 500;

        if (!message) {
            message = STATUS_CODES[code];
        }

        if (!type) {
            if (STATUS_CODES[code]) {
                type = 'HTTP';
            } else {
                type = 'UNRECOGNIZED';
                message = 'Unrecognized error. Please contact support.';
            }
        }

        super({...properties, code, message, type});
    }
}