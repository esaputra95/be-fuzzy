import { errorType } from "#root/helpers/errorType";
import { handleValidationError } from "#root/helpers/handleValidationError";
import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import fs from 'fs';

const getBobot = async (req:Request, res:Response) => {
    try {
        const bobot = JSON.parse(fs.readFileSync('data/bobot.json', 'utf8'));
        let label:any=[]
        for (const key in bobot) {
            label=[...label, key]
        }

        res.status(200).json({
            status: true,
            message: 'Success get data bobot',
            data: {
                label, bobot
            }
        })
    } catch (error) {
        let message = errorType
        message.message.msg = `${error}`
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            message =  await handleValidationError(error)
        }
        res.status(message.status).json({
            status: false,
            errors: [
                message.message
            ]
        })
    }
}

const getCLuster = async (req:Request, res:Response) => {
    try {
        const cluster = JSON.parse(fs.readFileSync('data/dataCluster.json', 'utf8'));
        let totalCluster
        totalCluster = await cluster.reduce((totalCLuster:{c1: number, c2:number, c3:number},item:any)=>{
            console.log({item});
            
            totalCLuster.c1 += item.c1 ;
            totalCLuster.c2 += item.c2 ;
            totalCLuster.c3 += item.c3 ;
            return totalCLuster
        }, { c1: 0, c2: 0, c3: 0 });
        
        res.status(200).json({
            status: true,
            message: 'Success get cluster',
            data: totalCluster
        })
    } catch (error) {
        let message = errorType
        message.message.msg = `${error}`
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            message =  await handleValidationError(error)
        }
        res.status(message.status).json({
            status: false,
            errors: [
                message.message
            ]
        })
    }
}

const getTotalPerformance = async (req:Request, res:Response) => {
    try {
        const totalPerformance = JSON.parse(fs.readFileSync('data/totalPerformance.json', 'utf8'));
        res.status(200).json({
            status: true,
            message: 'Success get total Performance',
            data: totalPerformance
        })
    } catch (error) {
        let message = errorType
        message.message.msg = `${error}`
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            message =  await handleValidationError(error)
        }
        res.status(message.status).json({
            status: false,
            errors: [
                message.message
            ]
        })
    }
}

const getKmeans = async (req:Request, res:Response) => {
    try {
        const totalPerformance = JSON.parse(fs.readFileSync('data/kmeansCentroid.json', 'utf8'));
        res.status(200).json({
            status: true,
            message: 'Success get total Performance',
            data: totalPerformance
        })
    } catch (error) {
        let message = errorType
        message.message.msg = `${error}`
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            message =  await handleValidationError(error)
        }
        res.status(message.status).json({
            status: false,
            errors: [
                message.message
            ]
        })
    }
}

export { getBobot, getCLuster, getTotalPerformance, getKmeans }