import multer from 'multer'

export const imageUpload = multer({
    limits: {
        fileSize: 5 * 1024 * 1024, //this is 5MB in form of a byte,
    },
    fileFilter(req, file, callback) { //request object, the file that we will send to the db, and a callback
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') { //reads the file extension
            // but simply checking the file extension is not safe, cuz the user can simply rewrite the file extension!
            callback(null, true)
        } else {
            callback(new Error('File type can only be png / jpeg'))
        }
    },
})
