import  { Request, Response, NextFunction } from 'express'
import validator from 'validator'
import { BadRequestError } from '../core/ApiError'

export default class Validators {

    static signupValidation(req: Request, res: Response, next: NextFunction) {

        if (typeof req.body.email === 'undefined'
            || typeof req.body.password === 'undefined'
            || typeof req.body.name === 'undefined') {
            next(new BadRequestError('Keys missing.'))
        }

        if (!validator.isEmail(req.body.email)) {
            next(new BadRequestError('Please enter valid email address'))
        }
        if (validator.isEmpty(req.body.password) ||
            !validator.isLength(req.body.password, { min: 5 })) {
            next(new BadRequestError('Password cannot be smaller than 5 characters.'))
        }
        if (validator.isEmpty(req.body.name)) {
            next(new BadRequestError('Please enter valid name'))
        }
        next()
    }

    static loginValidation(req: Request, res: Response, next: NextFunction) {
        if (typeof req.body.email === 'undefined'
            || typeof req.body.password === 'undefined'
        ) {
            next(new BadRequestError('Keys missing.'))
        }

        if (!validator.isEmail(req.body.email)) {
            next(new BadRequestError('Please enter valid email address'))
        }
        next()
    }

    static createOrUpdateQuoteValidation(req: Request, res: Response, next: NextFunction) {
        if (typeof req.body.text === 'undefined') {
            next(new BadRequestError('Keys missing.'))
        }
        if (validator.isEmpty(req.body.text)) {
            next(new BadRequestError('Quote cannot be empty'))
        }
        next()
    }

    static commentValidation(req: Request, res: Response, next: NextFunction){
        
        if (typeof req.body.text === 'undefined') {
            next(new BadRequestError('Keys missing.'))
        }
        if (validator.isEmpty(req.body.text)) {
            next(new BadRequestError('Quote cannot be empty'))
        }
        next()
    }


}