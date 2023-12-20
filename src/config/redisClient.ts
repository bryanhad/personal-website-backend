import {createClient} from 'redis'

const redisClient = createClient()
redisClient.connect().catch(console.error)

export default redisClient //after running this code, our server would be connected to our local redit db! and we can just use it throughout our code!