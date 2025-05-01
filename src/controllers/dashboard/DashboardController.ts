import { errorType } from "#root/helpers/errorType";
import { handleValidationError } from "#root/helpers/handleValidationError";
import Model from "#root/services/PrismaService";
import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import fs from 'fs';

function formatNumber(number:number, length = 3) {
    return number.toString().padStart(length, '0');
}

const varNumber:any = {
    'UIN Sultan Syarif Kasim Riau':'RI',
    'UIN Sjech M. Djamil Djambek Bukittinggi': 'BT',
    'UIN Imam Bonjol Padang': 'UP',
    'UIN Mahmud Yunus Batusangkar': 'BS',
    'UIN Syarif Hidayahtullah Jakarta': 'JK'
}

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
        let totalPerformance:any={}
        const query = req.query;
        if(query.university || query.gender || query.faculty){
            let dataExcel = JSON.parse(fs.readFileSync('data/questionnaire.json', 'utf8'));
            let newDataExcel:any = dataExcel

            if(query.university){
                newDataExcel= newDataExcel.filter((value:any)=> value.university === query.university)
            }
            if(query.gender){
                newDataExcel= newDataExcel.filter((value:any)=> value.gender === query.gender)
            }
            if(query.faculty){
                newDataExcel= newDataExcel.filter((value:any)=> value.faculty === query.faculty)
            }
            
            const bobot = JSON.parse(fs.readFileSync('data/bobot.json', 'utf8'));

            const subVariable = await Model.subVariables.findMany({
                where: {
                    km: 'yes'
                },
                select: {
                    id: true,
                    code: true
                }
            });
            const factor = await Model.factors.findMany({
                select: {
                    id: true,
                    code: true
                }
            });

            for (let indexExcel = 0; indexExcel < newDataExcel.length; indexExcel++) {
                let valueRow:any=[]
                valueRow=[...valueRow, {
                    label: 'name',
                    value: newDataExcel[indexExcel]['name']
                }]
                for (let indexFactor = 0; indexFactor < factor.length; indexFactor++) {
                    for (let indexSub = 0; indexSub < subVariable.length; indexSub++) {
                        const knowledgeManagement = await Model.knowledgeManagement.count({
                            where: {
                                subVariableId: subVariable[indexSub].id,
                                factorId: factor[indexFactor].id
                            }
                        })
                        for (let index = 0; index < knowledgeManagement; index++) {
                            const value = dataExcel[indexExcel]
                                [`${factor[indexFactor].code}_${subVariable[indexSub].code}${(index+1)}`]
                                * bobot[`${factor[indexFactor].code}_${subVariable[indexSub].code}${index+1}`];

                            let total = parseFloat(
                                totalPerformance[factor[indexFactor].code+'_'+subVariable[indexSub].code+(index+1)]??0)
                                +parseFloat(value+'')
                            
                            totalPerformance={
                                ...totalPerformance, 
                                [factor[indexFactor].code+'_'+subVariable[indexSub].code+(index+1)]: 
                                parseFloat(total.toFixed(4))
                            }
                        }
                    }
                }
            }
        }else{
            totalPerformance = JSON.parse(fs.readFileSync('data/totalPerformance.json', 'utf8'));
        }
        
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
        const query = req.query
        let dataKmeans:any=[]
            let newQuest:any=[]
        if(query.university || query.gender || query.faculty || query.programStudy || query.code){
            const quest = JSON.parse(fs.readFileSync('data/questionnaire.json', 'utf8'));
            for (let index = 0; index < quest.length; index++) {
                if(query.university && String(quest[index].university).toLowerCase().trim() != String(query.university).toLowerCase().trim()) continue
                if(query.gender && String(quest[index].gender).toLowerCase().trim() != String(query.gender).toLowerCase().trim()) continue
                if(query.faculty && String(quest[index].faculty).toLowerCase().trim() != String(query.faculty).toLowerCase().trim()) continue
                if (query.programStudy && String(quest[index].programStudy).toLowerCase().trim() != String(query.programStudy).toLowerCase().trim()) continue
                if (query.code && String(quest[index].name).toLowerCase().trim() != String(query.code).toLowerCase().trim()) continue
                
                newQuest=[...newQuest,
                    index
                ]
                
            }
            
            const dataPerformance = JSON.parse(fs.readFileSync('data/dataPerformance.json', 'utf8'));
            const headerIndicator = JSON.parse(fs.readFileSync('data/headerIndicator.json', 'utf8'));
            const indexCentroid = [0,3, 5];
            const cluster = JSON.parse(fs.readFileSync('data/finalIteration.json', 'utf8'));
            const totalCluster = JSON.parse(fs.readFileSync('data/totalCluster.json', 'utf8'));
            let newDataPerformance:any=[]
            for (const index of newQuest) {
                dataPerformance[index] ?
                newDataPerformance=[...newDataPerformance,
                    dataPerformance[index]
                ] : null
            }

            if(newDataPerformance.length===1){
                if(query.code){
                    const length = query?.code?.length ? Number(query?.code?.length) : 4
                    newDataPerformance=[...newDataPerformance,
                        dataPerformance[length], dataPerformance[(length+1)]
                    ]
                }else{
                    newDataPerformance=[...newDataPerformance,
                        dataPerformance[4], dataPerformance[5]
                    ]
                }
                
            }
            if(newDataPerformance.length===2){
                if(query.code){
                    const length = query?.code?.length ? Number(query?.code?.length) : 4
                    newDataPerformance=[...newDataPerformance,
                        dataPerformance[length]
                    ]
                }else{
                    newDataPerformance=[...newDataPerformance,
                        dataPerformance[8]
                    ]
                }
                
            }

            for (let indexCluster = 0; indexCluster < indexCentroid.length; indexCluster++) {
                let rowKmeans:any={}
                let total:number=0
                for (let indexPerformance = 0; indexPerformance < newDataPerformance.length; indexPerformance++) {
                    for (let indexHeader = 0; indexHeader < headerIndicator.length; indexHeader++) {
                        let value:number=parseFloat(rowKmeans[headerIndicator[indexHeader].value]??0)
                        if(indexCluster===0 && cluster[indexPerformance].cluster==="C1"){
                            value +=parseFloat(newDataPerformance?.[indexPerformance]?.[headerIndicator[indexHeader]?.value])
                        }
                        if(indexCluster===1 && cluster[indexPerformance].cluster==="C2"){
                            value += parseFloat(newDataPerformance?.[indexPerformance]?.[headerIndicator[indexHeader]?.value]) 
                        }
                        if(indexCluster===2 && cluster[indexPerformance].cluster==="C3"){
                            value +=parseFloat(newDataPerformance?.[indexPerformance]?.[headerIndicator[indexHeader]?.value]) 
                        }
                        
                        rowKmeans={
                            ...rowKmeans,
                            [headerIndicator[indexHeader].value]: value
                        }
                    }
                }

                // console.log({rowKmeans});
                

                
                let newDataKmeans:any={}
                for (const key in rowKmeans) {
                    newDataKmeans={
                        ...newDataKmeans,
                        [key]: parseFloat((rowKmeans[key]/totalCluster[`c${(indexCluster+1)}`]).toFixed(4))
                    }
                }
                // console.log({newDataKmeans});
                
                dataKmeans=[...dataKmeans, newDataKmeans]
            }
        }else{
            dataKmeans= JSON.parse(fs.readFileSync('data/kmeansCentroid.json', 'utf8'));
        }
        res.status(200).json({
            status: true,
            message: 'Success get total Performance',
            data: dataKmeans
        })
    } catch (error) {
        console.log({error});
        
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

const getMasterUniversity = async (req:Request, res:Response) => {
    try {
        let questionnaire = JSON.parse(fs.readFileSync('data/questionnaire.json', 'utf8'));
        let helper:any = {};
        let university:any=[];
        for (const value of questionnaire) {
            if(!helper[value.university]){
                helper[value.university] = true;
                university=[...university,
                    {label: value.university, value: value.university}
                ]
            }
        }
        res.status(200).json({
            status:true,
            message: "success",
            data: university
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

const getMasterFaculty = async (req:Request, res:Response) => {
    try {
        let questionnaire = JSON.parse(fs.readFileSync('data/questionnaire.json', 'utf8'));
        if(req.query.university){
            questionnaire = questionnaire.filter((a:any)=>a.university.trim() === (String(req.query?.university)).trim())
        }
        let helper:any = {};
        let faculty:any=[];
        for (const value of questionnaire) {
            if(!helper[value.faculty]){
                helper[value.faculty] = true;
                faculty=[...faculty,
                    {label: value.faculty, value: value.faculty}
                ]
            }
        }
        res.status(200).json({
            status:true,
            message: "success",
            data: faculty
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

const getMasterProgramStudy = async (req:Request, res:Response) => {
    try {
        let questionnaire = JSON.parse(fs.readFileSync('data/questionnaire.json', 'utf8'));
        if(req.query.university){
            questionnaire = questionnaire.filter((a:any)=>a.university.trim() === (String(req.query?.university)).trim())
        }
        if(req.query.faculty){
            questionnaire = questionnaire.filter((a:any)=>a.faculty.trim() === (String(req.query?.faculty)).trim())
        }
        let helper:any = {};
        let programStudy:any=[];
        for (const value of questionnaire) {
            if(!helper[value.programStudy]){
                helper[value.programStudy] = true;
                programStudy=[...programStudy,
                    {label: value.programStudy, value: value.programStudy}
                ]
            }
        }
        res.status(200).json({
            status:true,
            message: "success",
            data: programStudy
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

const setMaster = async (req:Request, res:Response) => {
    try {
        const {university:un} = req.query;
        console.log({un});
        
        let questionnaire = JSON.parse(fs.readFileSync('data/questionnaire.json', 'utf8'));
        if(un){
            questionnaire = questionnaire.filter((e:any)=>e.university===un)
        }
        console.log(questionnaire.university);
        
        let helper:any = {};
        let university:any=[];
        let gender:any=[];
        let faculty:any=[];
        let programStudy:any=[];
        let name:any=[];
        let univ=''
        let number=1;
        for (const value of questionnaire) {
            if(!helper[value.university]){
                helper[value.university] = true;
                university=[...university,
                    {label: value.university, value: value.university}
                ]
            }
            if(!helper[value.gender]){
                helper[value.gender] = true;
                gender=[...gender,
                    {label: value.gender, value: value.gender}
                ]
            }
            if(!helper[value.faculty]){
                helper[value.faculty] = true;
                faculty=[...faculty,
                    {label: value.faculty, value: value.faculty}
                ]
            }
            if(!helper[value.programStudy]){
                helper[value.programStudy] = true;
                programStudy=[...programStudy,
                    {label: value.programStudy, value: value.programStudy}
                ]
            }
            if(!helper[value.programStudy]){
                helper[value.programStudy] = true;
                programStudy=[...programStudy,
                    {label: value.programStudy, value: value.programStudy}
                ]
            }
            if(univ===value.university){
                number++
            }else{
                univ=value.university
            }
            const n = formatNumber(number);
            if(!helper[value.name]){
                name[value.name] = true;
                name=[...name,
                    {label: varNumber[value.university]+n, value: value.name}
                ]
            }
        }

        res.status(200).json({
            status:true,
            message: "success",
            data: {
                university,
                gender,
                faculty,
                programStudy,
                name
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

export { getBobot, getCLuster, getTotalPerformance, getKmeans, setMaster, getMasterFaculty, getMasterProgramStudy, getMasterUniversity }