import express from "express";
import {
    getBobot,
    getCLuster,
    getKmeans,
    getTotalPerformance
} from "#controllers/dashboard/DashboardController"
const route = express.Router()

route.get('/bobot', getBobot);
route.get('/cluster', getCLuster);
route.get('/total-performance', getTotalPerformance);
route.get('/kmeans', getKmeans);

export default route