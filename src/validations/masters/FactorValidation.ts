import { body } from 'express-validator';

const FactorsValidation = [
    body("name").exists({ checkFalsy: true })
        .withMessage("Factors name is required")
        .isString()
        .withMessage("Factors name should be string")
]

export default FactorsValidation