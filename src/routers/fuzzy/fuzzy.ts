import express from "express";
import { 
    InversMatriks,
    Perangkingan,
    download,
    processKmeans,
    Performance,
    compileExcel,
    calculationCentroid
} from "#controllers/fuzzy/FuzzyController"
const route = express.Router()

route.get('/', InversMatriks);
route.get('/rankings', Perangkingan);
route.get('/process-kmeans', processKmeans);
route.get('/download', download);
route.get('/performance', Performance);
route.post('/compile-excel', compileExcel);
route.get('/calculation-centroid', calculationCentroid);

export default route