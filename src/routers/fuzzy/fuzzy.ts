import express from "express";
import { 
    InversMatriks,
    Ranking,
    download,
    processKmeans,
    Performance,
    compileExcel,
    calculationCentroid,
    dataCentroid,
    jsonToExcel
} from "#controllers/fuzzy/FuzzyController"
const route = express.Router()

route.get('/', InversMatriks);
route.get('/rankings', Ranking);
route.get('/process-kmeans', processKmeans);
route.get('/download', download);
route.get('/performance', Performance);
route.post('/compile-excel', compileExcel);
route.get('/calculation-centroid', calculationCentroid);
route.get('/centroid', dataCentroid);
route.get('/json-to-excel', jsonToExcel);

export default route