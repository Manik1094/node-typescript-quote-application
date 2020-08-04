import mongoose, { Schema, Document } from 'mongoose'

export  interface Comment extends Document {
    text: string,  
    quote: Schema.Types.ObjectId, 
    creator: Schema.Types.ObjectId
}

const CommentSchema = new mongoose.Schema({
    text: {
        type: Schema.Types.String, 
        required: true
    }, 
    quoteId: {
        type: Schema.Types.ObjectId, 
        ref: 'Quote',
        required: true
    }, 
    creator: {
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    }
    
    
}, {timestamps: true})
export const CommentModel = mongoose.model<Comment>('Comment', CommentSchema, 'comments')