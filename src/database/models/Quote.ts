import mongoose, { Schema, Document, Mongoose } from 'mongoose'
import { User } from './User'
import { Comment } from './Comment'



export  interface Quote extends Document {
    text: string, 
    creator: User, 
    likes: User[], 
    comments: Comment[]
   
}

const QuoteSchema = new mongoose.Schema({
    text: {
        type: Schema.Types.String, 
        required: true
    }, 
    creator: {
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    }, 
    likes: [
        {
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true,
        }
    ], 
    comments: [
        {
            type: Schema.Types.ObjectId, 
            ref: 'Comment', 
            required: true
        }
    ]
    
}, { timestamps: true })

export const QuoteModel = mongoose.model<Quote>('Quote', QuoteSchema, 'quotes')