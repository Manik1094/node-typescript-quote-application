import { Response } from 'express'
import { NotFoundResponse, InternalServerResponse, BadRequestResponse, UnauthorizedResponse }
    from '../core/ApiResponse'

enum ErrorCode {
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    NOT_FOUND = 404,
    INTERNAL_ERROR = 500,
}

export class ApiError extends Error {
    constructor(public message: string, public errorCode: ErrorCode) {
        super(message)
    }

    public static handle(err: ApiError, res: Response): Response {
        switch (err.errorCode) {
            case ErrorCode.BAD_REQUEST:
                return new BadRequestResponse(err.message).send(res, this)

            case ErrorCode.UNAUTHORIZED:
                return new UnauthorizedResponse(err.message).send(res, this)

            case ErrorCode.NOT_FOUND:
                return new NotFoundResponse(err.message).send(res, this)

            case ErrorCode.INTERNAL_ERROR:
                return new InternalServerResponse(err.message).send(res, this)
        }
    }

}

export class BadRequestError extends ApiError {
    constructor(message: string) {
        super(message, ErrorCode.BAD_REQUEST)
    }
}

export class NotFoundError extends ApiError {
    constructor(message: string) {
        super(message, ErrorCode.NOT_FOUND)
    }
}

export class UnAuthorizedError extends ApiError {
    constructor(message: string) {
        super(message, ErrorCode.UNAUTHORIZED)
    }
}

export class InternalError extends ApiError {
    constructor(message: string) {
        super(message, ErrorCode.INTERNAL_ERROR)
    }
}