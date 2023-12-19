import { cleanEnv, port, str } from 'envalid'

// the envalid package is just to validate our env variables!
// if some thing is not added / not validated, it will throw an error

const env = cleanEnv(process.env, {
    MONGO_CONNECTION_STRING: str(),
    PORT: port(),
    WEBSITE_URL: str(),
    SERVER_URL: str(),
    SESSION_SECRET: str(),
    POST_REVALIDATION_KEY: str(),
    GOOGLE_CLIENT_ID: str(),
    GOOGLE_CLIENT_SECRET: str(),
    GITHUB_CLIENT_ID: str(),
    GITHUB_CLIENT_SECRET: str()
})

export default env
