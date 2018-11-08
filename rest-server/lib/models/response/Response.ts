export interface ISuccess {
    message?: string;
    data?: any;
}

export interface IError {
    message: string;
    type: any;
}

export interface IResponse {
    code: number;
    success?: ISuccess;
    error?: IError;
}

export default class Response implements IResponse {
    public code: number;
    public success?: ISuccess;
    public error?: IError;

    constructor(properties: any = {}) {
        const {code, message, data, type} = properties;

        this.code = code || 200;

        if (this.code < 400) {
            this.success = {
                message: message ? message : undefined,
                data: data ? data : undefined,
            };
        } else {
            this.error = {
                message: message ? message : undefined,
                type: type ? type : undefined,
            };
        }
    }
}