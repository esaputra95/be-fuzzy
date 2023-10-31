import express from "express";
import 'module-alias/register';
import 'dotenv/config'
import bodyParser from 'body-parser';
import cors from 'cors';

import login from './routers/auth/index'
import { factor, indicator, subVariable, user, variable } from "./routers/masters";
import { knowledgeManagement } from "./routers/knowledgeManagements";
import { AccessToken } from "./controllers/auth/middlewareController";
import { expertQuestionnaire } from "./routers/expertQuestionnaires";
import { Fuzzy } from "./routers/fuzzy";

const app = express()
app.use(cors()); // Parse JSON requests
app.use(bodyParser.json()); // Parse JSON requests
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/auth', login)
app.use('/users', user)
app.use('/variables', variable)
app.use('/sub-variables', subVariable)
app.use('/indicators', indicator)
app.use('/factors', factor)
app.use('/knowledge-managements', knowledgeManagement)
app.use('/expert-questionnaires', expertQuestionnaire)
app.use('/fuzzy', Fuzzy)

app.listen(3000, ()=> console.log('server run ip 127.0.0.1:3000'))