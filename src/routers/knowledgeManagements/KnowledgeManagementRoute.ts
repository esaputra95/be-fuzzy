import express from "express";
import { deleteData, getData, getDataById, postData, updateData } from "#controllers/knowledgeManagement/KnowledgeManagementController"
import validationMessage from "#root/validations/Validate";
import FactorsValidation from "#root/validations/masters/FactorValidation";
const route = express.Router()

route.get('/', getData);
route.post('/',  postData);
route.put('/:id',updateData);
route.delete('/:id', deleteData);
route.get('/:id', getDataById);

export default route