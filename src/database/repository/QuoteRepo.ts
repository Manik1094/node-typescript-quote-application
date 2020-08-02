
import { Quote, QuoteModel } from '../models/Quote'
import UserRepo from './UserRepo'
import mongoose, { isValidObjectId, Schema, Mongoose } from 'mongoose'
import { UserModel, User } from '../models/User'
import _ from 'lodash'


export default class QuoteRepo {

    public static async create(text: string, userId: string)
        : Promise<Quote> {
        const quote = new QuoteModel({
            text: text,
            creator: userId,
            likes: []
        })
        const createdQuote = await quote.save()
        const user = await UserRepo.addQuote(userId, createdQuote)

        return createdQuote.toObject()
    }

    public static async getQuotes(): Promise<Quote[]> {
        return QuoteModel.find()
            .populate('creator', 'name')
            .populate('likes')
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
   
}