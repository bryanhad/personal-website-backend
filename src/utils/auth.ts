import mongoose from 'mongoose'

export async function destroyAllActiveSessionForUser(userId: string) {
    const regExp = new RegExp('^' + userId) //will match string that starts with the userId

    mongoose.connection.db.collection('sessions').deleteMany({ _id: regExp }) //delete every session document where the _id starts with the userId
}
