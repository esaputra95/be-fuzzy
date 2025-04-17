import express from "express";
import { deleteData, getData, getDataById, postData, updateData, getDataForm } from "#controllers/expertQuestionnaire/ExpertQuestionnaireController"
import { AccessToken } from "#root/controllers/auth/middlewareController";
const route = express.Router()

route.get('/', getData);
route.post('/',  postData);
route.put('/:id',updateData);
route.delete('/:id', deleteData);
route.get('/form', getDataForm);
route.get('/:id', getDataById);

export default route