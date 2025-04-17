import { Request, Response } from "express";
import Model from "#services/PrismaService";
import bcrypt from 'bcrypt'
import { sign } from 'jsonwebtoken';
import { LoginInterface } from "#root/interfaces/AuthInterface";

export const Login = async (req:Request, res:Response) => {
    try {
        const data:LoginInterface = req.body
        if(!data.type){
            const user = await Model.users.findFirst({
                where: {
                    username: data.username
                }
            });
            if(!user) throw new Error('Username or password incorrect')
            const match = bcrypt.compare('123456789', user.password ?? '')
            if(!match) throw new Error('Username or password incorrect')
            const accessToken = sign({
                id: user.id,
                username: user.username,
                name: user.name,
                userType: 'admin'
            }, '1234567890');
            res.json({
                status: true,
                message: "OK",
                data: {
                    token: accessToken,
                    refreshToken: "refreshToken"
                    }
            })
            return;
        }else{
            if(data.password !== data.username) throw new Error()
            const user = await Model.respondents.findFirst({
                where: {
                    nik: data.username,
                }
            });
            if(!user) throw new Error('Username or password incorrect')
            const accessToken = sign({
                id: user.id,
                username: user.nik,
                name: user.name,
                userType: 'pakar'
            }, '1234567890');
            res.json({
                status: true,
                message: "OK",
                data: {
                    token: accessToken,
                    refreshToken: "refreshToken"
                    }
            })
            return;
        }
        
    } catch (error) {
        res.status(500).send({
            status: false,
            message: "Unauthorized",
            error: {
                displayMessage: "Your username or password is incorect"
            }
        })
    }
}