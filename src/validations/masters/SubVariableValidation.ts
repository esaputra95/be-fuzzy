import { body } from 'express-validator';

const SubVariablesValidation = [
    body("name").exists({ checkFalsy: true })
        .withMessage("Sub Variables name is required")
]

export default SubVariablesValidation