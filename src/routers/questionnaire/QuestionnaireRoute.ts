import express from "express";
import { getKnowledgeManagement } from '#controllers/questionnaire/QuestionnaireController'
const route = express.Router()

route.get('/knowledge-management', getKnowledgeManagement);

export default route