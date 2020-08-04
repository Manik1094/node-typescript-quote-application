
import { Quote, QuoteModel } from '../models/Quote'
import UserRepo from './UserRepo'
import  { isValidObjectId, Schema, Mongoose } from 'mongoose'
import {  User, UserModel } from '../models/User'
import _ from 'lodash'
import { CommentModel, Comment } from '../models/Comment'


export default class QuoteRepo {

    public static async create(text: string, userId: string)
        : Promise<Quote> {
        const quote = new QuoteModel({
            text: text,
            creator: userId,
            likes: [], 
            comments: []
        })
        const createdQuote = await quote.save()
        const user = await UserRepo.addQuote(userId, createdQuote)

        return createdQuote.toObject()
    }

    public static async getQuotes(): Promise<Quote[]> {
        return QuoteModel.find()
            .populate('creator', 'name')
            .populate('likes')
            .populate('comments')
            .select('_id text')
            .sort({ createdAt: -1 })
            .lean<Quote>()
            .exec()
    }

    public static async findQuote(quoteId: string): Promise<Quote | null> {
        console.log(`Quote id: ${quoteId}`)
        if (isValidObjectId(quoteId)) {
            return QuoteModel.findOne({ _id: quoteId }).lean<Quote>().exec()
        } else {
            console.log('Inside else')
            return null
        }
    }

    public static async updateQuote(quote: Quote, text: string): Promise<Quote | null> {
        return QuoteModel.findOneAndUpdate({ _id: quote._id }, { text: text }, { new: true }).lean<Quote>().exec()

    }

    public static async deleteQuote(quote: Quote): Promise<Quote | null> {
        if (isValidObjectId(quote._id)) {
            return QuoteModel.findByIdAndDelete({ _id: quote._id }).lean<Quote>().exec()
        } else {
            return null
        }
    }

    public static async addOrRemoveLike(quote: Quote, userId: string): Promise<Quote | null> {
        
       const user = quote.likes.filter(user => user._id.toString() === userId.toString()) 
        if (user.length > 0) {
            //Remove like 
            console.log('Inside remove like')
            var likes = _.remove(quote.likes, (n) => n !== user[0])
            return QuoteModel.findByIdAndUpdate({_id: quote._id}, {likes: likes}, {new: true})
            .lean<Quote>()
            .exec()
            
        } else {
            //add like
            let user = await UserRepo.findByUserId(userId) as User
            quote.likes.push(user)
            return QuoteModel.findOneAndUpdate({_id: quote._id}, {likes: quote.likes}, {new: true})
            .lean<Quote>()
            .exec()
        }
    }

    public static async getLikes(quote: Quote): Promise<User[]>{
        return UserModel.find({_id: {$in: quote.likes}})
        .select('name')
        .lean<User>()
        .exec()
    }

    public static async addComment(quote: Quote, userId: string, text: string): Promise<Quote | null>{
        const newComment = new CommentModel({
            text: text, 
            creator: userId, 
            quoteId: quote._id
        })
        const comment = await newComment.save()
        quote.comments.push(comment)
        console.log(`Comments: ${quote.comments}`)
        return QuoteModel.findOneAndUpdate({_id: quote._id}, {comments: quote.comments}, {new: true})
        .lean<Quote>()
        .exec()
    }

    public static async getComments(quote: Quote): Promise<Comment[] | null> {
        return CommentModel.find({ _id: { $in: quote.comments } })
            .populate('creator', 'name')
            .select('_id text')
            .lean<Comment>()
            .exec()

    }

    public static async findComment(commentId: string): Promise<Comment | null> {
        console.log(`Comment id: ${commentId}`)
        if (isValidObjectId(commentId)) {
            return CommentModel.findOne({ _id: commentId }).lean<Comment>().exec()
        } else {
            console.log('Inside else')
            return null
        }
    }

    public static async deleteComment(comment: Comment, quote: Quote) {
        const deletedComment = await CommentModel.findOneAndDelete({ _id: comment._id })
        if (!deletedComment) {
            return null
        }

        const matchedComment = quote.comments.filter(cm => {
            return cm._id.toString() === comment._id.toString()
        })
        if (matchedComment.length <= 0) {
            return null
        }

        var updatedComments = _.remove(quote.comments, (n) => n._id.toString() !== matchedComment[0]._id.toString())
        return QuoteModel.findOneAndUpdate({ _id: quote._id }, { comments: updatedComments }, { new: true })
            .lean<Quote>()
            .exec()
    }

}