import { validateBufferMIMEType } from 'validate-image-type'
import * as yup from 'yup'

export const imageFileSchema = yup
    .mixed<Express.Multer.File>()
    .test(
        'valid-image',
        'The uploaded file is not a valid image',
        async (file) => {
            if (!file) return true //if there is no image file, well just return true, cuz an image is not required field

            //we only want to validate if there IS an image!
            const validImage = await validateBufferMIMEType(file?.buffer, {
                allowMimeTypes: ['image/png', 'image/jpeg'],
            })
            return validImage.ok
        }
    )
