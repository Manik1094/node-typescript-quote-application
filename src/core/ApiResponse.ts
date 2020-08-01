import { Response } from "express"

enum StatusCode {
    SUCCESS = 200,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    NOT_FOUND = 404,
    INTERNAL_ERROR = 500,
    CREATED = 201
}

abstract class ApiResponse {
    constructor(protected message: string, protected statusCode: StatusCode) { }

    public send<T extends object>(res: Response, response: T): Response {
        return res.status(this.statusCode).json({ message: this.message, data: response })
    }
}

export class SuccessResponse extends ApiResponse {
    constructor(message: string) {
        super(message, StatusCode.SUCCESS)
    }
}

export class UnauthorizedResponse extends ApiResponse {
    constructor(message: string) {
        super(message, StatusCode.UNAUTHORIZED)
    }
}

export class InternalServerResponse extends ApiResponse {
    constructor(message: string) {
        super(message, StatusCode.INTERNAL_ERROR)
    }
}

export class BadRequestResponse extends ApiResponse {
    constructor(message: string) {
        super(message, StatusCode.BAD_REQUEST)
    }
}

export class NotFoundResponse extends ApiResponse {
    constructor(message: string) {
        super(message, StatusCode.NOT_FOUND)
    }
}

export class CreatedResponse extends ApiResponse {
    constructor(message: string) {
        super(message, StatusCode.CREATED)
    }
}