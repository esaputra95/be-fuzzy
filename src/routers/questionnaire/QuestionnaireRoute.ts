import express from "express";
import { getIndicator, postData, getData, duplicateData } from '#controllers/questionnaire/QuestionnaireController'
const route = express.Router()

route.post('/', postData);
route.post('/duplicate', duplicateData);
route.get('/', getData);
route.get('/indicator', getIndicator);

export default route