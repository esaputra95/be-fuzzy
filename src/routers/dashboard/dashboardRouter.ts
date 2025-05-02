import express from "express";
import {
    getBobot,
    getCLuster,
    getKmeans,
    getTotalPerformance,
    setMaster,
    getMasterUniversity,
    getMasterFaculty,
    getMasterProgramStudy,
    getMasterCode
} from "#controllers/dashboard/DashboardController"
const route = express.Router()

route.get('/bobot', getBobot);
route.get('/cluster', getCLuster);
route.get('/total-performance', getTotalPerformance);
route.get('/kmeans', getKmeans);
route.get('/get-master', setMaster);
route.get('/university', getMasterUniversity);
route.get('/faculty', getMasterFaculty);
route.get('/program-study', getMasterProgramStudy);
route.get('/code', getMasterCode);

export default route