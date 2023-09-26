import express from "express";
import 'module-alias/register';
import 'dotenv/config'
import bodyParser from 'body-parser';

import login from './routers/auth/index'
import { user } from "./routers/masters";
import { AccessToken } from "./controllers/auth/middlewareController";

const app = express()
app.use(bodyParser.json()); // Parse JSON requests
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/auth', login)
app.use('/users', AccessToken, user)

app.listen(3000, ()=> console.log('server run ip 127.0.0.1:3000'))