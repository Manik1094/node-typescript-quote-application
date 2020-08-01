import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { UnAuthorizedError } from '../core/ApiError'
import { JwtPayload } from '../core/JWT'

export default function isAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization
    if (typeof authHeader === 'undefined') {
        return next(new UnAuthorizedError('Unauthorized'))
    }
    const token = authHeader.split(' ')[1]
    if (typeof token === 'undefined') {
        return next(new UnAuthorizedError('Unauthorized'))
    }

    let decodedToken
    try {
        decodedToken = jwt.verify(token, 'secret', { complete: true })
    } catch (err) {
        return next(new UnAuthorizedError('Unauthorized'))
    }
    if (!decodedToken) {
        return next(new UnAuthorizedError('Unauthorized'))
    }
    if (typeof decodedToken === 'object') {
        res.locals.userId = (decodedToken as JwtPayload).payload.userId
        next()
    }
}

