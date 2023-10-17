import { KnowledgeManagementsInterface, KnowledgeManagementsQueryInterface } from "#root/interfaces/knowledgeManagement/KnowledgeManagementInterface";
import Model from "#root/services/PrismaService";
import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { handleValidationError } from "#root/helpers/handleValidationError";
import { errorType } from "#root/helpers/errorType";

const getData = async (req:Request<{}, {}, {}, KnowledgeManagementsQueryInterface>, res:Response) => {
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
        const data = await Model.knowledgeManagement.findMany({
            where: {
                ...filter
            },
            include: {
                subVariables: true,
                indicators: true,
                factors: true
            },
            skip: skip,
            take: take
        });
        const total = await Model.knowledgeManagement.count({
            where: {
                ...filter
            }
        })
        res.status(200).json({
            status: true,
            message: "successful in getting KnowledgeManagement data",
            data: {
                knowledgeManagements: data,
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
        const data = [...req.body.indicators];
        // await Model.knowledgeManagement.create({data: data});
        for (const value of data) {
            await Model.knowledgeManagement.create({
                data: {
                    ...value,
                    subVariableId: req.body.subVariableId,
                    factorId: req.body.factorId
                }
            })
        }
        
        res.status(200).json({
            status: true,
            message: 'successful in created KnowledgeManagement data'
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
        await Model.knowledgeManagement.update({
            where: {
                id: parseInt(req.params.id+'')
            },
            data: data
        });
        res.status(200).json({
            status: true,
            message: 'successful in updated KnowledgeManagement data'
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

const deleteData = async (req:Request<KnowledgeManagementsInterface>, res:Response)=> {
    try {
        await Model.knowledgeManagement.delete({
            where: {
                id: parseInt(req.params.id+'')
            }
        })
        res.status(200).json({
            status: false,
            message: 'successfully in deleted KnowledgeManagement data'
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

const getDataById = async (req:Request<KnowledgeManagementsInterface>, res:Response) => {
    try {
        const model = await Model.knowledgeManagement.findUnique({
            where: {
                id: parseInt(req.params.id+'')
            }
        })
        if(!model) throw new Error('data not found')
        res.status(200).json({
            status: true,
            message: 'successfully in get KnowledgeManagement data',
            data: {
                KnowledgeManagement: model
            }
        })
    } catch (error) {
        console.log({error});
        
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

export {
    getData,
    postData,
    updateData,
    deleteData,
    getDataById
}