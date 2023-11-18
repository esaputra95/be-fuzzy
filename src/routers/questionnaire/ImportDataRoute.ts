import express from "express";
import { importData } from '#controllers/questionnaire/ImportData'
const route = express.Router()

route.post('/', importData);

export default route