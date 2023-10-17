import { body } from 'express-validator';

const VariablesValidation = [
    body("name").exists({ checkFalsy: true })
        .withMessage("Variables name is required")
        .isString()
        .withMessage("Variables name should be string")
]

export default VariablesValidation