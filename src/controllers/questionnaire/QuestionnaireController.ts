import { errorType } from "#root/helpers/errorType";
import { handleValidationError } from "#root/helpers/handleValidationError";
import Model from "#root/services/PrismaService"
import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import fs from 'fs';

const getIndicator = async (req:Request, res:Response) => {
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
            data: response
        })
        
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error
        })
    }
}

const postData = async (req:Request, res:Response) => {
    try {
        let questionnaire = JSON.parse(fs.readFileSync('data/questionnaire.json', 'utf8'));
        const data = req.body;
        let dataRespondent = {...data};
        delete dataRespondent.questionary
        let pushData:any={}
        pushData={...pushData, 
            name: data.name,
            faculty: data.faculty,
            gender: data.gender,
            group: data.group,
            lastStudy: data.lastStudy,
            skill: data.skill,
            status: data.status,
            studyProgram: data.studyProgram,
            university: data.university,
            respondent: data
        }
        for (let index = 0; index < data.questionary.length; index++) {
            if(data.questionary[index]){
                pushData={...pushData, [data.questionary[index].label]:data.questionary[index].value ?? ''}
            }
        }
        questionnaire=[...questionnaire, pushData];
        fs.writeFileSync('data/questionnaire.json', JSON.stringify(questionnaire, null, 2), 'utf8');
        res.status(200).json({
            status: true,
            message: "Success Save Questionnaire"
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
const varNumber:any = {
    'UIN Sultan Syarif Kasim Riau':'RI',
    'UIN Sjech M. Djamil Djambek Bukittinggi': 'BT',
    'UIN Imam Bonjol Padang': 'UP',
    'UIN Mahmud Yunus Batusangkar': 'BS',
    'UIN Syarif Hidayahtullah Jakarta': 'JK'
}
function formatNumber(number:number, length = 3) {
    return number.toString().padStart(length, '0');
}
const getData = async (req:Request, res:Response) => {
    try {
        let dataResponse:any=[];
        let limit:number = parseInt(req.params.limit ?? 20)
        const questionnaire = await JSON.parse(fs.readFileSync('data/questionnaire.json', 'utf8'));
        let univ=''
        let number=1;
        for (let index = (questionnaire.length-1); index >= 0; index--) {
            if(univ===questionnaire[index].university){
                number++
            }else{
                univ=questionnaire[index].university
            }
            const n = formatNumber(number);
            dataResponse=[...dataResponse,
                {
                    ...questionnaire[index],
                    name: varNumber[questionnaire[index].university]+n,
                }
            ]
        }
        res.status(200).json({
            status: true,
            message: 'Success get data',
            data: dataResponse
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: `${error}`
        })
    }
}

const duplicateData = async () => {
    try {
        const questionnaire = await JSON.parse(fs.readFileSync('data/questionnaire.json', 'utf8'));
        let newQuestionnaire:any= [];
        newQuestionnaire=[...questionnaire];
        for (let index = 0; index < questionnaire.length; index++) {
            if(newQuestionnaire.length>=500) break;
            newQuestionnaire=[
                {
                    ...questionnaire[index],
                    name: questionnaire[index]['name']+(index+1),
                },
                ...newQuestionnaire
            ]
        }
        fs.writeFileSync('data/questionnaire.json', JSON.stringify(newQuestionnaire, null, 2), 'utf8');
    } catch (error) {
        
    }
}

export { getIndicator, postData, getData, duplicateData }