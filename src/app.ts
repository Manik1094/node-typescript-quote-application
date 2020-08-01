//Following Aspects to be considered for a better solution.
// Reference - https://afteracademy.com/blog/design-node-js-backend-architecture-like-a-pro
/*
    1) Type Safety
    2) Seperation of Concerns
    3) Feature Encapsulation
    4) Better Error Handling
    5) Better Response Handling
    6) Better Promise management
    7) Robust Unit Tests
    8) Simple Deployability
*/

import express, { Request, Response, NextFunction } from 'express'
import bodyParser from 'body-parser'
import { NotFoundError, ApiError } from './core/ApiError'
import authRoutes from './routes/access/auth'
import quoteRoutes from './routes/quote/quote'

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    if (req.method == 'OPTIONS') {
        return res.sendStatus(200)
    }
    next()
})

app.use('/auth', authRoutes)
app.use('/quote', quoteRoutes)

//404 handling middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    const err = new NotFoundError('404 Not found')
    ApiError.handle(err, res)
    next()
})

//Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiError) {
        ApiError.handle(err, res)
    }
})

export default app

