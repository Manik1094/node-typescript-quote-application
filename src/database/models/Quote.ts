import mongoose, { Schema, Document } from 'mongoose'

export  interface Quote extends Document {
    text: string, 
    creator: Schema.Types.ObjectId
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
    }
    
}, { timestamps: true })
export const QuoteModel = mongoose.model<Quote>('Quote', QuoteSchema, 'quotes')