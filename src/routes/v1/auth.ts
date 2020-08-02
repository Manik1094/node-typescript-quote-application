import express from 'express'
import Validators from '../../helpers/validators'
import UserRepo from '../../database/repository/UserRepo'
import { BadRequestError, InternalError, NotFoundError, UnAuthorizedError } from '../../core/ApiError'
import bcrypt from 'bcrypt'
import { SuccessResponse } from '../../core/ApiResponse'
import { User } from '../../database/models/User'
import _ from 'lodash'


const router = express.Router()

router.post('/signup', Validators.signupValidation, async (req, res, next) => {
    const user = await UserRepo.findByEmail(req.body.email)
    if (user) {
        return next(new BadRequestError('User with this email id already exists'))
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const createdUser = await UserRepo.create(req.body.email, req.body.name, hashedPassword) as User
    if (!createdUser) {
        return next(new InternalError('Something went wrong'))
    }
    return new SuccessResponse('User created Successfully..').send(res, _.pick(createdUser, ['_id', 'name', 'email']))
})

router.post('/login', Validators.loginValidation,  async (req, res, next) => {
    const user = await UserRepo.findByEmail(req.body.email) as User
    console.log(user)
    if(!user){
        return next(new NotFoundError('User not found.'))
    }
    const isEqual = await bcrypt.compare(req.body.password, user.password)
    if(!isEqual){
        return next(new UnAuthorizedError('Wrong password.'))
    }
    const userToken = UserRepo.signToken(user._id.toString(), user.email)
    return new SuccessResponse('Logged in successfully')
    .send(res, {
        token: userToken, 
        userId: user._id.toString()
    })

})

export default router