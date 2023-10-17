import express from "express";
import { deleteData, getData, getDataById, postData, updateData, getDataSelect } from "#controllers/masters/VariableController"
import validationMessage from "#root/validations/Validate";
import VariablesValidation from "#root/validations/masters/VariableValidation";
const route = express.Router()

route.get('/', getData);
route.post('/',  validationMessage(VariablesValidation), postData);
route.put('/:id', validationMessage(VariablesValidation), updateData);
route.delete('/:id', deleteData);
route.get('/select', getDataSelect);
route.get('/:id', getDataById);

export default route