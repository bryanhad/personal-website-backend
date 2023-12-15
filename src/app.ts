import 'dotenv/config'
import express from 'express';

const app = express()

app.get('/', (req, res) => {
    res.send('Hello my brother! This is from the server of porta 5000!')
})

export default app;