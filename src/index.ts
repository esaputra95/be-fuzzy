import express from "express";
import 'module-alias/register';
import 'dotenv/config'
import bodyParser from 'body-parser';
import cors from 'cors';
import KMeans from 'ml-kmeans';

import login from './routers/auth/index'
import { factor, indicator, subVariable, user, variable } from "./routers/masters";
import { knowledgeManagement } from "./routers/knowledgeManagements";
import { AccessToken } from "./controllers/auth/middlewareController";
import { expertQuestionnaire } from "./routers/expertQuestionnaires";
import { Fuzzy } from "./routers/fuzzy";
import { Import, Questionnaire } from "./routers/questionnaire";
import { DashboardRouter } from "./routers/dashboard";

const app = express()
app.use(cors()); // Parse JSON requests
app.use(bodyParser.json()); // Parse JSON requests
app.use(bodyParser.urlencoded({ extended: true }))
// app.use((req, res, next) => {
//     res.setTimeout(1800000, () => {
//       // Handle timeout, misalnya mengirimkan tanggapan timeout
//       res.status(503).send('Request timeout');
//     });
  
//     next();
//   });

  
 
// app.post('/cluster', (req, res) => {
//   const data = req.body; // Ambil data array dari request body
//   const numberOfClusters = 3; // Tentukan jumlah cluster yang diinginkan

//   try {
//       const result = KMeans(data, numberOfClusters);

//       res.json({
//           clusters: result.clusters,      // Indeks cluster untuk setiap data
//           centroids: result.centroids,    // Titik centroid dari setiap cluster
//       });
//   } catch (error) {
//       console.error('Clustering error:', error);
//       res.status(500).json({ error: 'Clustering failed' });
//   }
// });

app.use('/auth', login)
app.use('/users', user)
app.use('/variables', variable)
app.use('/sub-variables', subVariable)
app.use('/indicators', indicator)
app.use('/factors', factor)
app.use('/knowledge-managements', knowledgeManagement)
app.use('/expert-questionnaires', AccessToken, expertQuestionnaire)
app.use('/fuzzy', Fuzzy)
app.use('/questionnaire', Questionnaire)
app.use('/dashboard', DashboardRouter)
app.use('/import', Import)
app.use('/download',express.static('public'))

app.listen(3000, ()=> console.log('server run ip 127.0.0.1:3000'))