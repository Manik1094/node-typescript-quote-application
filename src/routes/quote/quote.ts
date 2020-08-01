import {Router, Request, Response, NextFunction} from 'express'
import Validators from '../../helpers/validators'
import { InternalError, NotFoundError, UnAuthorizedError } from '../../core/ApiError'
import { SuccessResponse } from '../../core/ApiResponse'
import isAuth from '../../middleware/is-auth'
import UserRepo from '../../database/repository/UserRepo'
import QuoteRepo from '../../database/repository/QuoteRepo'
import { Quote } from '../../database/models/Quote'
import _ from 'lodash'

const router = Router()

//Create new Quote
router.post('/', isAuth, Validators.createOrUpdateQuoteValidation, async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals
    const user = await UserRepo.findByUserId(userId)
    if(!user){
        return next(new NotFoundError('User not found'))
    }
    const createdQuote = await QuoteRepo.create(req.body.text, userId) as Quote
    if(!createdQuote){
        return next(new InternalError('Something went wrong. Try again later..'))
    }
    return next(new SuccessResponse('Quote created!').send(res, _.pick(createdQuote, ['_id', 'text', 'creator'])))

})

//Get list of quotes
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    const quotes = await QuoteRepo.getQuotes()
    if(quotes.length < 0){
        return next(new NotFoundError('Quotes does not exist..'))
    }
    return next(new SuccessResponse('Success').send(res, quotes))
})

//Update Quote
router.put('/:quoteId', isAuth, Validators.createOrUpdateQuoteValidation,  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals
    const quoteId: string = req.params.quoteId
    const quote = await QuoteRepo.findQuote(quoteId)
    if(!quote){
        return next(new NotFoundError('Quote does not exist for this id.'))
    }

    if(quote.creator.toString() !== userId.toString()){
        return next(new UnAuthorizedError('Not authorized to update the quote'))
    }

    const updatedQuote = await QuoteRepo.updateQuote(quote, req.body.text)
    if(!updatedQuote){
        return next(new InternalError('Something went wrong, Please try again later'))
    }

    return next(new SuccessResponse('Quote Updated.').send(res, _.pick(updatedQuote, ['_id', 'text', 'creator'])))
})

//Delete Quote
router.delete('/:quoteId', isAuth,  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals
    const quoteId: string = req.params.quoteId
    const quote = await QuoteRepo.findQuote(quoteId)
    if(!quote){
        return next(new NotFoundError('Quote does not exist for this id.'))
    }
    if(quote.creator.toString() !== userId.toString()){
        return next(new UnAuthorizedError('Not authorized to delete the quote'))
    }

    const deletedQuote = await QuoteRepo.deleteQuote(quote)
    const updatedUser = await UserRepo.deleteQuote(userId, quote)
    if(!deletedQuote || !updatedUser){
        return next(new InternalError('Something went wrong, Please try again later.'))
    }
    return next(new SuccessResponse('Quote deleted').send(res, _.pick(deletedQuote, ['_id', 'text', 'creator'])))

})



export default router