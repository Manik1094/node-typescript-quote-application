import mongoose, { Schema, Document } from 'mongoose'

export  interface User extends Document {
    name: string, 
    email: string, 
    password: string, 
    quotes: Schema.Types.ObjectId[]
}

const UserSchema = new mongoose.Schema({
    email: {
        type: Schema.Types.String, 
        required: true
    }, 
    name: {
        type: Schema.Types.String, 
        required: true
    }, 
    password: {
        type: Schema.Types.String, 
        required: true
    }, 
    quotes: [
        {
            type: Schema.Types.ObjectId, 
            ref: 'Quote'
        }
    ]
    
})
export const UserModel = mongoose.model<User>('User', UserSchema, 'users')