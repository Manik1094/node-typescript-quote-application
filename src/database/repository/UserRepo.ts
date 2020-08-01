import { User, UserModel } from '../models/User'
import jwt from 'jsonwebtoken'
import { Quote } from '../models/Quote'

export default class UserRepo {

    public static async create(email: string, name: string, password: string)
        : Promise<User> {
        const user = new UserModel({
            email: email,
            name: name,
            password: password
        })
        const createdUser = await user.save()
        return createdUser.toObject()
    }

    public static async findByEmail(email: string): Promise<User | null> {
        return UserModel.findOne({ email: email })
            .lean<User>()
            .exec()
    }

    public static async findByUserId(userId: string): Promise<User | null> {
        return UserModel.findById({ _id: userId })
            .lean<User>()
            .exec()
    }

    public static async addQuote(userId: string, quote: Quote): Promise<User> {
        const user = await UserModel.findById(userId)
        user?.quotes.push(quote._id)
        const createdUser = await user?.save()
        return createdUser?.toObject()
    }

    public static async deleteQuote(userId: string, quote: Quote): Promise<User> {
        const user = await UserModel.findById(userId)
        const quoteIndex = user?.quotes.indexOf(quote._id) as number
        user?.quotes.splice(quoteIndex, 1)
        const updatedUser = await user?.save()
        return updatedUser?.toObject()
    }

    public static signToken(userId: string, email: string): string {
        const token: string = jwt.sign({
            userId: userId,
            email: email
        }, 'secret', { expiresIn: '1h' })
        return token
    }
}