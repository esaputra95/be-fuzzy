import { FactorsInterface, FactorsQueryInterface } from "#root/interfaces/FactorInterface";
import Model from "#root/services/PrismaService";
import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { handleValidationError } from "#root/helpers/handleValidationError";
import { errorType } from "#root/helpers/errorType";

const getData = async (req:Request<{}, {}, {}, FactorsQueryInterface>, res:Response) => {
    try {
        const query = req.query;
        // PAGING
        const take:number = parseInt(query.limit ?? 20 )
        const page:number = parseInt(query.page ?? 1 );
        const skip:number = (page-1)*take
        // FILTER
        let filter:any= {}
        query.name ? filter = {...filter, name: { contains: query.name }} : null
        
        if(res.locals?.userType === 'pakar'){
            filter = {...filter, id: res.locals?.id}
        }
        const data = await Model.respondents.findMany({
            where: {
                ...filter
            },
            skip: skip,
            take: take
        });
        const total = await Model.respondents.count({
            where: {
                ...filter
            }
        })
        res.status(200).json({
            status: true,
            message: "successful in getting factor data",
            data: {
                factors: data,
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
        const dataRespondent = {...req.body}
        delete dataRespondent.questionary;
        dataRespondent.type = 'ahli'
        const saveRespondent = await Model.respondents.create({
            data: dataRespondent
        });
        Model.$transaction(async (Model)=> {
            for (const value of data.questionary) {
                if(value){
                    const newData = {
                        respondentId: saveRespondent.id,
                        indicatorId1: parseInt(value.indicatorId1),
                        indicatorId2: parseInt(value.indicatorId2),
                        indexIndicator1: parseInt(value.indexIndicator1),
                        indexIndicator2: parseInt(value.indexIndicator2),
                        subVariableId: parseInt(value.subVariableId),
                        factorId: parseInt(value.factorId),
                        value: parseFloat(value.value)
                    }
                    await Model.questionnaires.create({
                        data: newData
                    });
                }
                
            }
        })
        // const saveRespondent = await Model.respondents.create({
        //     data: dataRespondent
        // });
        // for (const value of data.questionary) {
        //     if(value){
        //         const newData = {
        //             respondentId: saveRespondent.id,
        //             indicatorId1: value.indicatorId1,
        //             indicatorId2: value.indicatorId2,
        //             value: parseFloat(value.value)
        //         }
        //         await Model.questionnaires.create({
        //             data: newData
        //         });
        //     }
            
        // }
        
        res.status(200).json({
            status: true,
            message: 'successful in created factor data'
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
        await Model.factors.update({
            where: {
                id: parseInt(req.params.id+'')
            },
            data: data
        });
        res.status(200).json({
            status: true,
            message: 'successful in updated factor data'
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

const deleteData = async (req:Request<FactorsInterface>, res:Response)=> {
    try {
        await Model.respondents.delete({
            where: {
                id: parseInt(req.params.id+'')
            }
        })
        res.status(200).json({
            status: false,
            message: 'successfully in deleted factor data'
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

const getDataById = async (req:Request<FactorsInterface>, res:Response) => {
    try {
        const model = await Model.factors.findUnique({
            where: {
                id: parseInt(req.params.id+'')
            }
        })
        if(!model) throw new Error('data not found')
        res.status(200).json({
            status: true,
            message: 'successfully in get factor data',
            data: {
                factor: model
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

const getDataSelect = async (req:Request<{}, {}, {}, FactorsQueryInterface>, res:Response) => {
    try {
        const query = req.query
        let filter:any= []
        query.name ? filter = [...filter, {name: { contains: query.name }}] : null
        const data = await Model.factors.findMany({
            where: {
                name: {
                    contains: query.name ?? ''
                }
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
                factors: response
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

const getDataForm = async ({}, res:Response) => {
    try {
        const subVariables = await Model.subVariables.findMany({
            where: {
                km: 'yes'
            }
        })
        
        const dataFactors = await Model.factors.findMany()
        let response:any =[]
        for (const value of subVariables) {
            let respFactor:any=[]
            for (const valueFactor of dataFactors) {
                const indicators = await Model.knowledgeManagement.findMany({
                    where: {
                        subVariableId: value.id,
                        factorId: valueFactor.id
                    },
                    include: {
                        indicators: true,
                    }
                })
                respFactor = [...respFactor, {
                    ...valueFactor,
                    knowledge: [...indicators]

                }]
            }
            response = [...response, 
            {
                ...value,
                factor: [...respFactor]
            }]
        }

        res.status(200).json({
            status: true,
            message: "successful in getting sub variable data",
            data: {
                form: response
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
    getDataSelect,
    getDataForm
}