import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';

type DecodeType = {
    id:string,
    username: string,
    name: string,
    iat: number
}
export interface CustomRequest extends Request {
    token: DecodeType | jwt.JwtPayload;
}

const AccessToken = (req:Request, res:Response, next:NextFunction) => {
    try {
        const authHeader = req?.headers?.authorization ?? '';
        if(!authHeader) res.send(403)
        const token = authHeader.split(" ")[1]??false;
        if(token==null) return res.send(401);
        const decoded = jwt.verify(token, '1234567890');
        
        jwt.verify(token, '1234567890', (err, decode:any)=>{
            if(err) return res.send(403);
            console.log({decode});
            res.locals.userId = decode?.id ?? ''
            return next()
        })
    } catch (error) {
        return res.send(403)
    }
}

export {
    AccessToken
}