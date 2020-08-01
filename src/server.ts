import app from './app'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

mongoose.Promise = global.Promise

const result = dotenv.config()
console.log(result.parsed)

const port = process.env.PORT

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
    mongoose.connect(`${process.env.MONGODB_URI}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(result => {
        console.log('Database connected Successfully...')
    })
    .catch(err => {
        console.log('Error connecting to db.')
    })
})
