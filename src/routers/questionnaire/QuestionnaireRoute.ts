import express from "express";
import { getIndicator, postData, getData } from '#controllers/questionnaire/QuestionnaireController'
const route = express.Router()

route.post('/', postData);
route.get('/', getData);
route.get('/indicator', getIndicator);

export default route