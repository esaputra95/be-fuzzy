import express from "express";
import { deleteData, getData, getDataById, getDataSelect, postData, updateData } from "#controllers/masters/FactorController"
import validationMessage from "#root/validations/Validate";
import FactorsValidation from "#root/validations/masters/FactorValidation";
const route = express.Router()

route.get('/', getData);
route.post('/',  validationMessage(FactorsValidation), postData);
route.put('/:id', validationMessage(FactorsValidation), updateData);
route.delete('/:id', deleteData);
route.get('/select', getDataSelect);
route.get('/:id', getDataById);

export default route