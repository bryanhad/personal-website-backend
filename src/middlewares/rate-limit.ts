import rateLimit from "express-rate-limit";
//when the rateLimit has been reached, it will send an error code of 429
// which is for Too many request

// the rate limit is tied to the user's IP address and is stored in the memory of the server.
// so we can reset the memory by resetting our server if u want.. im talking to u future bryan.. 👁👄👁

// but, u can also set the storing of the rate limits to an external storage like a db.. even mongodb.. if u want that is
export const loginRateLimit = rateLimit({
    windowMs: 1000 * 60 * 60, //1 hour
    max: 8, //this basically set a rate limit where in a span of 1 hours, you can only hit this endpoint 8 times!
    standardHeaders: true, // use the new standard headers instead. 
    legacyHeaders: false, //deactivate old X-RateLimit headers. curious? well just read the docs lazy boi!
    skipSuccessfulRequests: true, //if the request is successful, it will not count to the rate limit count!
})

export const requestVerificationCodeRateLimit = rateLimit({
    windowMs: 1000 * 60, //1 minute
    max: 1, // we set the rate limit of requesting the verif code to 1/minute, to match up to our frontend where it has a countdown of 1 limit for each verification code request
    standardHeaders: true, 
    legacyHeaders: false, 
    skipFailedRequests: true, //if the request fails like if when the user want to reset password, but sends the wrong email address, we still want to let our poor user to request again to send another.. it is okay in this case, since when that happens, our email won't be send cuz it just our server that sends an error response like usual..
})

export const createBlogRateLimit = rateLimit({
    windowMs: 1000 * 60 * 20, //20 minutes
    max: 8,
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: true
})

export const updateBlogRateLimit = rateLimit({ // we will give more to the updatePostRateLimit cuz like remember, everytime we delete or update the post, we trigger revalidation to our nextjs cache from our endpoint on the server! and vercel gave us certain ammount of revalidation quota which are alot, but it could still be bad if we hit the threshold
    windowMs: 1000 * 60 * 60, //1 hour
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: true
})