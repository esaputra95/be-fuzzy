import express from "express";
import { deleteData, getData, getDataById, postData, updateData, getDataSelect } from "#controllers/masters/SubVariableController"
import validationMessage from "#root/validations/Validate";
import  SubVariablesValidation from "#root/validations/masters/SubVariableValidation";
 "#root/validations/masters/Sub";
const route = express.Router()

route.get('/', getData);
route.post('/',  validationMessage(SubVariablesValidation), postData);
route.put('/:id', validationMessage(SubVariablesValidation), updateData);
route.delete('/:id', deleteData);
route.get('/select', getDataSelect);
route.get('/:id', getDataById);

export default route