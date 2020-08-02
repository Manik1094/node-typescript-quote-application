import mongoose, { Schema, Document, Mongoose } from 'mongoose'
import { User } from './User'

export  interface Quote extends Document {
    text: string, 
    creator: User, 
    likes: User[]
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
    ]
    
}, { timestamps: true })

export const QuoteModel = mongoose.model<Quote>('Quote', QuoteSchema, 'quotes')