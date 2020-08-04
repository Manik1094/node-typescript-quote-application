import { Router, Request, Response, NextFunction } from 'express'
import Validators from '../../helpers/validators'
import { InternalError, NotFoundError, UnAuthorizedError, BadRequestError } from '../../core/ApiError'
import { SuccessResponse } from '../../core/ApiResponse'
import isAuth from '../../middleware/is-auth'
import UserRepo from '../../database/repository/UserRepo'
import QuoteRepo from '../../database/repository/QuoteRepo'
import { Quote } from '../../database/models/Quote'
import _ from 'lodash'
import {  Comment } from '../../database/models/Comment'
import { User } from '../../database/models/User'


const router = Router()

//Create new Quote
router.post('/', isAuth, Validators.createOrUpdateQuoteValidation, async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals
    const user = await UserRepo.findByUserId(userId)
    if (!user) {
        return next(new NotFoundError('User not found'))
    }
    const createdQuote = await QuoteRepo.create(req.body.text, userId) as Quote
    if (!createdQuote) {
        return next(new InternalError('Something went wrong. Try again later..'))
    }
    return next(new SuccessResponse('Quote created!').send(res, _.pick(createdQuote, ['_id', 'text', 'creator'])))

})

//Get list of quotes
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    const quotes = await QuoteRepo.getQuotes()

    if (quotes.length < 0) {
        return next(new NotFoundError('Quotes does not exist..'))
    }
    return next(new SuccessResponse('Success').send(res, quotes.map(quote => {
        return {
            _id: quote._id,
            text: quote.text,
            creator: quote.creator,
            likes: quote.likes.length, 
            comments: quote.comments.length
        }
    })))
})

//Update Quote
router.put('/:quoteId', isAuth, Validators.createOrUpdateQuoteValidation, async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals
    const quoteId: string = req.params.quoteId
    const quote = await QuoteRepo.findQuote(quoteId)
    if (!quote) {
        return next(new NotFoundError('Quote does not exist for this id.'))
    }

    if (quote.creator.toString() !== userId.toString()) {
        return next(new UnAuthorizedError('Not authorized to update the quote'))
    }

    const updatedQuote = await QuoteRepo.updateQuote(quote, req.body.text)
    if (!updatedQuote) {
        return next(new InternalError('Something went wrong, Please try again later'))
    }

    return next(new SuccessResponse('Quote Updated.').send(res, {
        _id: updatedQuote._id,
        text: updatedQuote.text,
        creator: updatedQuote.creator,
        likes: updatedQuote.likes.length

    }))
})

//Delete Quote
router.delete('/:quoteId', isAuth, async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals
    const quoteId: string = req.params.quoteId
    const quote = await QuoteRepo.findQuote(quoteId)
    if (!quote) {
        return next(new NotFoundError('Quote does not exist for this id.'))
    }
    if (quote.creator.toString() !== userId.toString()) {
        return next(new UnAuthorizedError('Not authorized to delete the quote'))
    }

    const deletedQuote = await QuoteRepo.deleteQuote(quote)
    const updatedUser = await UserRepo.deleteQuote(userId, quote)
    if (!deletedQuote || !updatedUser) {
        return next(new InternalError('Something went wrong, Please try again later.'))
    }
    return next(new SuccessResponse('Quote deleted').send(res, _.pick(deletedQuote, ['_id', 'text', 'creator'])))

})

//Add or remove Likes
router.post('/like/:quoteId', isAuth, async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals
    const quoteId: string = req.params.quoteId
    const quote = await QuoteRepo.findQuote(quoteId)
    if (!quote) {
        return next(new NotFoundError('Quote does not exists for this id..'))
    }
    const updatedQuote = await QuoteRepo.addOrRemoveLike(quote, userId)
    if (!updatedQuote) {
        return next(new InternalError('Something went wrong...'))
    }
    return next(new SuccessResponse('Likes updated').send(res, {
        _id: updatedQuote._id,
        text: updatedQuote.text,
        creator: updatedQuote.creator,
        likes: updatedQuote.likes.length
    }))
})

//Get Likes of Quote
router.get('/like/:quoteId', isAuth, async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals
    const quoteId = req.params.quoteId
    const quote = await QuoteRepo.findQuote(quoteId) as Quote
    if(!quote){
        return next(new NotFoundError('Quote does not exists for this id.'))
    }
    const likes = await QuoteRepo.getLikes(quote) as User[]
    if(likes.length <= 0){
        return next(new NotFoundError('No likes found for this quote.'))
    }
    return next(new SuccessResponse('success').send(res, likes))
})


//Add Comments
router.post('/comment/:quoteId', Validators.commentValidation,  isAuth, async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals
    const quoteId = req.params.quoteId
    const quote = await QuoteRepo.findQuote(quoteId)
    if (!quote) {
        return next(new NotFoundError('Quote does not exists for this id..'))
    }
    const updatedQuote = await QuoteRepo.addComment(quote, userId, req.body.text) as Quote
    console.log(`Updated Quote: ${updatedQuote}`)
    if(!updatedQuote){
        return next(new InternalError('Something went wrong...'))
    }
    return next(new SuccessResponse('Comment added').send(res, {
        _id: updatedQuote._id, 
        text: updatedQuote.text, 
        creator: updatedQuote.creator, 
        likes: updatedQuote.likes.length, 
        comments: updatedQuote.comments.length
    }))
})

//Get comments of quote
router.get('/comment/:quoteId', isAuth, async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals
    const quoteId = req.params.quoteId
    const quote = await QuoteRepo.findQuote(quoteId) as Quote
    if(!quote){
        return next(new NotFoundError('Quote does not exists for this id.'))
    }
    const comments = await QuoteRepo.getComments(quote) as Comment[]
    if(comments.length <= 0){
        return next(new NotFoundError('No comments found for this quote.'))
    }
    return next(new SuccessResponse('success').send(res, comments))
})

//Delete comment
router.delete('/comment/:quoteId', isAuth, async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals
    const quoteId = req.params.quoteId
    const commentId = req.query.commentId
    if(!commentId){
        return next(new BadRequestError('Query params missing'))
    }
    const quote = await QuoteRepo.findQuote(quoteId) as Quote
    if(!quote){
        return next(new NotFoundError('Quote does not exists for this id.'))
    }
    const comment = await QuoteRepo.findComment(commentId as string)
    if(!comment){
        return next(new NotFoundError('No Comment found for this id.'))
    }
    if(comment.creator.toString() !== userId){
        return next(new UnAuthorizedError('No authorized to delete the comment.'))
    }

    const updatedQuote = await QuoteRepo.deleteComment(comment, quote) as Quote
    if(!updatedQuote){
        return next(new InternalError('Something went wrong..'))
    }
    return next(new SuccessResponse('Comment deleted').send(res, {
        _id: updatedQuote._id, 
        text: updatedQuote.text, 
        creator: updatedQuote.creator, 
        likes: updatedQuote.likes.length, 
        comments: updatedQuote.comments.length
    }))
})




export default router