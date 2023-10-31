import express from "express";
import { InversMatriks } from "#controllers/fuzzy/FuzzyController"
const route = express.Router()

route.get('/', InversMatriks);

export default route