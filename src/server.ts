import app from './app'
import env from './env'
import mongoose from 'mongoose'

const port = env.PORT

mongoose
    .connect(env.MONGO_CONNECTION_STRING)
    .then(() => {
        console.log('Mongoose connected!')
        app.listen(port, () => {
            console.log(`Server running on port: ${port}`)
        })
    })
    .catch(console.error) //this line is equivalent to: .catch(err => console.error(err))
