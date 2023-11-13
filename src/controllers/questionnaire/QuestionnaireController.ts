import Model from "#root/services/PrismaService"
import { Request, Response } from "express";

const getKnowledgeManagement = async (req:Request, res:Response) => {
    try {
        const data = await Model.knowledgeManagement.findMany({
            include: {
                subVariables: true,
                factors: true,
                indicators: true
            }
        });
        console.log({data});

        res.status(200).json({
            status: true,
            data: data
        })
        
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error
        })
    }
}

export { getKnowledgeManagement }