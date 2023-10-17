import { body } from 'express-validator';

const IndicatorsValidation = [
    body("name").exists({ checkFalsy: true })
        .withMessage("Indicators name is required")
        .isString()
        .withMessage("Indicators name should be string")
]

export default IndicatorsValidation