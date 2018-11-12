import ErrorResponse from "../models/response/ErrorResponse";
import SuccessResponse from "../models/response/Response";

export function error(...args) {
    const [res, code, type, message] = args;

    return res.status(code).json(new ErrorResponse({
        code,
        type,
        message,
    }));
}

export function response(...args) {
    const [res, data] = args;

    return res.json(new SuccessResponse({
        data,
    }));
}