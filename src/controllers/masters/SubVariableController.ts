import { SubVariablesInterface, SubVariablesQueryInterface } from "#root/interfaces/SubVariableInterface";
import Model from "#root/services/PrismaService";
import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { handleValidationError } from "#root/helpers/handleValidationError";
import { errorType } from "#root/helpers/errorType";

const getData = async (req:Request<{}, {}, {}, SubVariablesQueryInterface>, res:Response) => {
    try {
        const query = req.query;
        // PAGING
        const take:number = parseInt(query.limit ?? 20 )
        const page:number = parseInt(query.page ?? 1 );
        const skip:number = (page-1)*take
        // FILTER
        let filter:any= []
        query.name ? filter = [...filter, {name: { contains: query.name }}] : null
        if(filter.length > 0){
            filter = {
                OR: [
                    ...filter
                ]
            }
        }
        const data = await Model.subVariables.findMany({
            where: {
                km: 'yes',
                ...filter
            },
            include: {
                variables: true
            },
            skip: skip,
            take: take
        });
        const total = await Model.subVariables.count({
            where: {
                ...filter
            }
        })
        res.status(200).json({
            status: true,
            message: "successful in getting sub variable data",
            data: {
                subVariables: data,
                info:{
                    page: page,
                    limit: take,
                    total: total
                }
            }
        })
    } catch (error) {
        let message = errorType
        message.message.msg = `${error}`
        res.status(message.status).json({
            status: false,
            errors: [
                message.message
            ]
        })
    }
}

const postData = async (req:Request, res:Response) => {
    try {
        const data = { ...req.body};
        await Model.subVariables.create({data: data});
        res.status(200).json({
            status: true,
            message: 'successful in created sub variable data'
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

const updateData = async (req:Request, res:Response) => {
    try {
        const data = { ...req.body};
        await Model.subVariables.update({
            where: {
                id: parseInt(req.params.id+'')
            },
            data: data
        });
        res.status(200).json({
            status: true,
            message: 'successful in updated sub variable data'
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

const deleteData = async (req:Request<SubVariablesInterface>, res:Response)=> {
    try {
        await Model.subVariables.delete({
            where: {
                id: parseInt(req.params.id+'')
            }
        })
        res.status(200).json({
            status: false,
            message: 'successfully in deleted sub variable data'
        })
    } catch (error) {
        let message = {
            status:500,
            message: { msg: `${error}` }
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            message =  await handleValidationError(error)
        }
        res.status(message.status).json({
            status: message.status,
            errors: [
                message.message
            ]
        })
    }
}

const getDataById = async (req:Request<SubVariablesInterface>, res:Response) => {
    try {
        const model = await Model.subVariables.findUnique({
            where: {
                id: parseInt(req.params.id+'')
            }
        })
        if(!model) throw new Error('data not found')
        res.status(200).json({
            status: true,
            message: 'successfully in get sub variable data',
            data: {
                subVariable: model
            }
        })
    } catch (error) {
        let message = {
            status:500,
            message: { msg: `${error}` }
        }
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

const getDataSelect = async (req:Request<{}, {}, {}, SubVariablesQueryInterface>, res:Response) => {
    try {
        const query = req.query
        let filter:any= []
        query.name ? filter = [...filter, {name: { contains: query.name }}] : null
        const data = await Model.subVariables.findMany({
            where: {
                name: {
                    contains: query.name ?? ''
                },
                km: "yes"
            },
            take: 20
        })
        let response:any=[]
        for (const value of data) {
            response = [...response, {
                value: value.id,
                label: value.name
            }]
        }
        res.status(200).json({
            status: true,
            message: "successful in getting sub variable data",
            data: {
                subVariables: response
            }
        })
    } catch (error) {
        let message = errorType
        message.message.msg = `${error}`
        res.status(message.status).json({
            status: false,
            errors: [
                message.message
            ]
        })
    }
}

export {
    getData,
    postData,
    updateData,
    deleteData,
    getDataById,
    getDataSelect
}