import express from "express";
import { InversMatriks, Perangkingan, download, processKmeans } from "#controllers/fuzzy/FuzzyController"
const route = express.Router()

route.get('/', InversMatriks);
route.get('/rankings', Perangkingan);
route.get('/process-kmeans', processKmeans);
route.get('/download', download);

export default route