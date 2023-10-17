import express from "express";
import { deleteData, getData, getDataById, postData, updateData, getDataSelect } from "#controllers/masters/IndicatorController"
import validationMessage from "#root/validations/Validate";
import IndicatorsValidation from "#root/validations/masters/IndicatorValidation";
const route = express.Router()

route.get('/', getData);
route.post('/',  validationMessage(IndicatorsValidation), postData);
route.put('/:id', validationMessage(IndicatorsValidation), updateData);
route.delete('/:id', deleteData);
route.get('/select', getDataSelect);
route.get('/:id', getDataById);

export default route