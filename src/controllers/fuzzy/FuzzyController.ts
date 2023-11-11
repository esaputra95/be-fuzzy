import { dataDecision, dataIR, dataInvers } from "#root/helpers/dataDefault";
import { errorType } from "#root/helpers/errorType";
import Model from "#root/services/PrismaService";
import { Request, Response } from "express";
import csv from 'csv-parser';
import fs from 'fs';
import xlsx, { IJsonSheet } from "json-as-xlsx"
import { Prisma } from "@prisma/client";
import { handleValidationError } from "#root/helpers/handleValidationError";

const processKmeans = async (req:Request<{}, {}, {}, {subVariableId:string, factorId: string}>, res:Response) => {
    try {
        // DATA CENTROID INDEX 0, 58, 167
        let indexCentroid = [0, 58, 167]
        let dataExcel:any=[]
        const bobot = JSON.parse(fs.readFileSync('data/bobot.json', 'utf8'));
        let data: IJsonSheet[] = []
        let dataCluster:any=[]
        fs.createReadStream('data.csv')
        .pipe(csv())
        .on('data', (data) => dataExcel.push(data))
        .on('end', async () => {
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
            let tmpDataPerfomance:any=[]
            let tmpHeader:any=[]
            let oldCluster:any={}
            let indexIterasi=0
            let statusLoop=true;

            let totalCluster
            let originalDataPerformance:any=[];
            let originalHeaderPerformance:any=[]
            while (statusLoop) {
                let header:any=[];
                let dataPerformance:any=[]
                
                if(indexIterasi===0){
                    for (let indexExcel = 0; indexExcel < dataExcel.length; indexExcel++) {
                        let valueRow:any={}
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
                                        [`${factor[indexFactor].code}_${subVariable[indexSub].code}${index+1}`]
                                        * bobot[`${factor[indexFactor].code}_${subVariable[indexSub].code}${index+1}`];
                                    if(indexExcel==0){
                                        header=[...header,
                                            {
                                                label: `${factor[indexFactor].code}_${subVariable[indexSub].code}${index+1}`,
                                                value: `${factor[indexFactor].code}_${subVariable[indexSub].code}${index+1}`
                                            }
                                        ];
                                    }
                                    
                                    valueRow={...valueRow, 
                                            [`${factor[indexFactor].code}_${subVariable[indexSub].code}${index+1}`]
                                            :parseFloat(value.toFixed(4))
                                        }
                                    
                                }
                            }
                        }
                        dataPerformance=[...dataPerformance,
                            valueRow
                        ]
                    }
                } else if (indexIterasi===1){
                    for (let indexRow = 0; indexRow < tmpDataPerfomance.length; indexRow++) {
                        let cluster:any=[]
                        for (let indexCluster = 0; indexCluster < 3; indexCluster++) {
                            let value=0;
                            for (let indexCol = 0; indexCol < Object.keys(tmpDataPerfomance[indexRow]).length; indexCol++) {
                                value += Math.pow((tmpDataPerfomance[indexRow][tmpHeader[indexCol].value]
                                    - tmpDataPerfomance[indexCentroid[indexCluster]][tmpHeader[indexCol].value]), 2);
                            }
                            cluster={...cluster,
                                [`JC${(indexCluster+1)}`]: parseFloat((Math.sqrt(value)).toFixed(4))
                            };
                            if(indexRow===0){
                                header=[...header,
                                    {
                                        label: `JC${(indexCluster+1)}`,
                                        value: `JC${(indexCluster+1)}`
                                    }
                                ];
                            }
                        }
                        const clusterMin = Object.keys(cluster).sort((a, b)=> cluster[a]-cluster[b]);
                        const indexCluster = Object.keys(cluster).findIndex((key)=> cluster[key]===cluster[clusterMin[0]]);
                        dataPerformance=[...dataPerformance, 
                            {
                                ...cluster,
                                'min': cluster[clusterMin[0]],
                                'cluster': 'C'+(indexCluster+1)
                            }
                        ]
                    }
                    // break
                }else {
                    // SUSUN DATA CENTROID CLUSTER
                    let dataCentroid:any=[]
                    for (let index = 0; index < 3; index++) {
                        let centroid={}
                        for (let indexCol = 0; indexCol < Object.keys(originalDataPerformance[index]).length; indexCol++) {
                            let value:number=0
                            for (let indexRow = 0; indexRow < originalDataPerformance.length; indexRow++) {
                                if(index===0){
                                    if(tmpDataPerfomance[indexRow]?.cluster==="C1"){
                                        value+= originalDataPerformance[indexRow]
                                            [
                                                originalHeaderPerformance[indexCol]?.value ?? 0
                                            ]
                                    }
                                }else if(index==1){
                                    if(tmpDataPerfomance[indexRow]?.cluster==="C2"){
                                        value+= originalDataPerformance[indexRow]
                                            [
                                                originalHeaderPerformance[indexCol]?.value ?? 0
                                            ]
                                    }
                                } else {
                                    if(tmpDataPerfomance[indexRow]?.cluster==="C3"){
                                        value+= originalDataPerformance[indexRow]
                                            [
                                                originalHeaderPerformance[indexCol]?.value ?? 0
                                            ]
                                    }
                                }

                            }
                            centroid={...centroid,
                                [originalHeaderPerformance[indexCol]?.value]: 
                                    parseFloat((value/totalCluster[`c${(index+1)}`]).toFixed(4))
                            }
                        }
                        dataCentroid=[...dataCentroid, centroid]
                    }

                    for (let indexRow = 0; indexRow < originalDataPerformance.length; indexRow++) {
                        let cluster:any=[]
                        for (let indexCluster = 0; indexCluster < dataCentroid.length; indexCluster++) {
                            let value=0;
                            for (let indexCol = 0; indexCol < Object.keys(originalDataPerformance[indexRow]).length; indexCol++) {
                                value += Math.pow((originalDataPerformance[indexRow][originalHeaderPerformance[indexCol].value]
                                    - dataCentroid[indexCluster][originalHeaderPerformance[indexCol].value]), 2);
                            }
                            cluster={...cluster,
                                [`JC${(indexCluster+1)}`]: parseFloat((Math.sqrt(value)).toFixed(4))
                            };
                            if(indexRow===0){
                                header=[...header,
                                    {
                                        label: `JC${(indexCluster+1)}`,
                                        value: `JC${(indexCluster+1)}`
                                    }
                                ];
                            }
                        }
                        const clusterMin = Object.keys(cluster).sort((a, b)=> cluster[a]-cluster[b]);
                        const indexCluster = Object.keys(cluster).findIndex((key)=> cluster[key]===cluster[clusterMin[0]]);
                        dataPerformance=[...dataPerformance, 
                            {
                                ...cluster,
                                'min': cluster[clusterMin[0]],
                                'cluster': 'C'+(indexCluster+1)
                            }
                        ]
                    }
                }

                totalCluster = dataPerformance.reduce((totalCLuster:{c1: number, c2:number, c3:number},item:any)=>{
                    if(item.cluster==="C1") totalCLuster.c1 += 1 ;
                    if(item.cluster==="C2") totalCLuster.c2 += 1 ;
                    if(item.cluster==="C3") totalCLuster.c3 += 1 ;
                    return totalCLuster
                }, { c1: 0, c2: 0, c3: 0 });

                dataCluster=[...dataCluster,
                    totalCluster
                ]
                
                let sheetName = indexIterasi===0 ? 'Performance' : 'Interasi '+indexIterasi
                if(indexIterasi!==0){
                    header= [
                        ...header,
                        {
                            label: 'Nilai Min',
                            value: 'min'
                        },
                        {
                            label: 'Cluster',
                            value: 'cluster'
                        }
                    ]
                }
                tmpDataPerfomance=[...dataPerformance]

                data = [
                    ...data,
                    {
                        sheet: sheetName,
                        columns: [
                            ...header
                        ],
                        content: [
                            ...dataPerformance
                        ],
                    }
                ];

                
                if(indexIterasi===0){
                    originalHeaderPerformance=[...header];
                    originalDataPerformance=[...dataPerformance];
                }
                
                tmpHeader=[...header]
                if(totalCluster.c1===oldCluster.c1 && totalCluster.c2===oldCluster.c2 && totalCluster.c3 === oldCluster.c3){
                    statusLoop=false
                }
                oldCluster={...totalCluster}
                header=[]
                indexIterasi++
            }

            data= [...data,
                {
                    sheet: 'Data Cluster',
                    columns: [
                        { label: 'C1', value:'c1'},
                        { label: 'C2', value:'c2'},
                        { label: 'C3', value:'c3'},
                    ],
                    content: [...dataCluster]
                }
            ]

            let settings = {
                fileName: "DataIterasi", 
                extraLength: 3,
                writeMode: "writeFile", 
                writeOptions: {},
                RTL: true,
            }

            const buffer = xlsx(data, settings)
            res.writeHead(200, {
                "Content-Type": "application/octet-stream",
                "Content-disposition": "attachment; filename=DataIterasi.xlsx",
            })
            res.end(buffer)
        });
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

const InversMatriks = async (req:Request<{}, {}, {}, {subVariableId:string, factorId: string}>, res:Response) => {
    try {
        const query:{subVariableId:string, factorId: string} = req.query;

        const count = await Model.knowledgeManagement.count({
            where:{
                subVariableId: parseInt(query.subVariableId+''),
                factorId: parseInt(query.factorId+'')
            }
        })

        const data = await countData(count, query);

        res.status(200).json({
            status: true,
            message: "successful in getting factor data",
            data: {
                info:{
                    page: 0,
                    limit: 0,
                    total: 0
                },
                ...data
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

const Perangkingan = async (req:Request, res:Response) => {
    try {
        const subVariable = await Model.subVariables.findMany({
            where: {
                km: 'yes'
            }
        })
        const factor = await Model.factors.findMany()
        let ranking:any=[]
        let dataJson:any={}
        let totalKm=0
        for (const valueSub of subVariable) {
            let kriteria:any=[]
            for (const valueFactor of factor) {
                const count = await Model.knowledgeManagement.count({
                    where:{
                        subVariableId: parseInt(valueSub.id+''),
                        factorId: parseInt(valueFactor.id+'')
                    }
                })
                totalKm+= count
                const query = {
                    subVariableId: valueSub.id+'',
                    factorId: valueFactor.id+''
                }
                const data = await countData(count, query);
                let dataNormalization:any=[]
                for (let index = 0; index < data?.normalization.length; index++) {
                    dataJson={...dataJson,
                        [`${data?.factor?.code}_${data?.subVariable?.code}${index+1}`] : data?.normalization[index]
                    }
                    dataNormalization=[...dataNormalization, 
                        {
                            value:  data?.normalization[index],
                            label: `${index+1}`
                        }
                    ]
                }
                
                kriteria=[...kriteria,
                    {
                        factor: valueFactor,
                        bobot: dataNormalization,
                    }
                ]
            }
            ranking=[...ranking, {
                subVariable: {
                    ...valueSub,
                    total: totalKm
                },
                data: kriteria
            }]
            totalKm=0
        }

        fs.writeFileSync('data/bobot.json', JSON.stringify(dataJson, null, 2), 'utf8');
        res.status(200).json({
            data: ranking
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

const countData = async (count:number, query: {subVariableId: string, factorId: string}) => {
    try {
        const subVariable = await Model.subVariables.findFirst({
            select: {
                _count: {
                    select: {
                        indicators: true
                    }
                },
                name: true,
                id: true,
                code: true
            },
            where: {
                km: "yes",
                id: parseInt(query.subVariableId+'')
            }
        })

        const dataFactor = await Model.factors.findFirst({
            where: {
                id: parseInt(query.factorId+'')
            }
        })
        let dataVSub:any=[]
        const respondent = await Model.respondents.findMany({
            include: {
                questionnaires: {
                    where: {
                        subVariableId: parseInt(query.subVariableId+''),
                        factorId: parseInt(query.factorId+'')
                    }
                }
            }
        });
        let newData:any=[]
        // MENYUSUN NILAI INVERS MATRIX
        let checkNilai:number=0
        for (let indexResp = 0; indexResp < respondent.length; indexResp++) {
            let arrayData:any=[]
            const question = respondent[indexResp].questionnaires
            
            let reduce=1;
            for (let index = 0; index < question.length; index++) {
                checkNilai+=parseFloat(question[index].value+'' ?? 0)
                let value = parseInt(question[index].value+'') > 0 ? 
                    parseInt(question[index].value+'') : 
                    parseInt(question[index].value+'')* -1    
                arrayData=[...arrayData, value]
                if(arrayData.length===(count-reduce)){
                    if(arrayData.length!==count){
                        let lengthInv = count-arrayData.length;
                        for (let indexInv = 0; indexInv < lengthInv; indexInv++) {
                            if((indexInv+1)===lengthInv){
                                arrayData.splice((lengthInv-1),0,1)
                            }else{
                                arrayData.splice(indexInv, 0,'x')    
                            }
                        }    
                    }
                    newData=[...newData, [...arrayData]]
                    arrayData=[]
                    reduce+=1;
                }
            };
            // MENYISIPKAN NILAI (1) PADA DATA INVERS MATRIX
            for (let i = 0; i < newData.length; i++) {
                if(i!==0){
                    for (let j = 0; j < i; j++) {
                        newData[i].splice(j,1,parseFloat((1/newData[j][i]).toFixed(4)))
                    }
                }
            }
            
            let endData:any=[];
            for (let k = 0; k < newData.length; k++) {
                endData=[...endData, parseFloat((1/newData[k][newData.length]).toFixed(4))];
            }
            endData[newData.length]=1;
            newData = [ ...newData, endData ]
            let dataMatrix:any=[]
            
            if(checkNilai>0){
                for (let indexInvers = 0; indexInvers < newData.length; indexInvers++) {
                    let dataRow:any=[]
                    for (let indexCol = 0; indexCol < newData[indexInvers].length; indexCol++) {
                        dataRow=[...dataRow, dataInvers[newData[indexInvers][indexCol]+'']]
                    }
                    dataMatrix=[...dataMatrix, dataRow]
                }
            }else{
                dataMatrix=[...newData]
            }

            checkNilai=0

            dataVSub=[
                ...dataVSub,
                {
                    'data':[...dataMatrix],
                    'respondentName': respondent[indexResp].name,
                    'total': count,
                    'subVariableCode': subVariable?.code
                }
            ]
            newData=[]
        }
        
        // PERHITUNGAN PERKALIAN ANTAR MATRIKS PERBANDINGAN 
        let lengthIndicator = count
        let multiplicationMatrix:any=[]
        for (let indexRow = 0; indexRow < (lengthIndicator); indexRow++) {
            let hasil:any=[]
            for (let indexCol = 0; indexCol < (lengthIndicator); indexCol++) {
                let nilai=1
                for (let index = 0; index < dataVSub.length; index++) {
                    nilai*=dataVSub[index].data[indexRow][indexCol]
                }
                hasil=[...hasil, parseFloat(nilai.toFixed(4))]
                nilai=0
                
            }
            multiplicationMatrix=[...multiplicationMatrix, hasil]
            hasil=[]
        }

        // AKAR PANGKAT SEBANYAK RESPONDEN
        let squaredRootOf:any=[]
        for (let index = 0; index < multiplicationMatrix.length; index++) {
            let tmpSquaredRootOf:any=[]
            let value=0
            for (let index2 = 0; index2 < multiplicationMatrix[index].length; index2++) {
                value = Math.pow(multiplicationMatrix[index][index2], (1/respondent.length))
                tmpSquaredRootOf=[...tmpSquaredRootOf, parseFloat(value.toFixed(4))]
                value=0
            }
            squaredRootOf=[...squaredRootOf, tmpSquaredRootOf]
            tmpSquaredRootOf=[]
        }
        let squaredRootOfLas:any=[]
        for (let index = 0; index < squaredRootOf.length; index++) {
            let value=0
            for (let index2 = 0; index2 < squaredRootOf.length; index2++) {
                value+=squaredRootOf[index2][index];
            }
            squaredRootOfLas=[...squaredRootOfLas, parseFloat(value.toFixed(4))];
            value=0
        }
        squaredRootOf[lengthIndicator]=squaredRootOfLas;
        
        // EIGEN VECTOR
        let eigenVector:any=[]
        for (let index = 0; index < multiplicationMatrix.length; index++) {
            let tmpEigenVector:any=[]
            let average=0
            for (let index2 = 0; index2 < multiplicationMatrix[index].length; index2++) {
                let value = squaredRootOf[index][index2]/squaredRootOfLas[index2];
                average+=value
                tmpEigenVector=[...tmpEigenVector, parseFloat(value.toFixed(4))]
            }
            tmpEigenVector=[...tmpEigenVector, parseFloat((average/tmpEigenVector.length).toFixed(4))]
            eigenVector=[...eigenVector, tmpEigenVector]
            tmpEigenVector=[]
            average=0
        }
        
        let eigenVectorLast:any=[]
        for (let index = 0; index < multiplicationMatrix.length; index++) {
            let value=0
            for (let index2 = 0; index2 < multiplicationMatrix[index].length; index2++) {
                value+=eigenVector[index2][index];
            }
            eigenVectorLast=[...eigenVectorLast, Math.round(value)];
            value=0
        }
        
        eigenVector=[...eigenVector, [...eigenVectorLast, 1]];

        // MENGUKUR KONSISTENSI UNTUK MENDAPATKAN NILAI LAMDA
        let lamda:any=[]
        let totalAverage=0
        for (let index = 0; index < squaredRootOf.length; index++) {
            let tmpLamda:any=[]
            let total=0
            for (let index2 = 0; index2 < squaredRootOf[index].length; index2++) {
                let value = squaredRootOf[index][index2]*eigenVector[index][eigenVector.length-1]
                total+=value;
                tmpLamda=[...tmpLamda, parseFloat(value.toFixed(4))]
                
            }
            let average = total/eigenVector[index][eigenVector.length-1];
            if(index===squaredRootOf[index].length){
                totalAverage+=average;
            }
            tmpLamda=[...tmpLamda, parseFloat(total.toFixed(4)), parseFloat(average.toFixed(4))];
            lamda=[...lamda, tmpLamda]
            tmpLamda=[]
        }
        lamda.pop();
        let valueLamda = parseFloat((totalAverage/lamda.length).toFixed(4))
        let valueCi = parseFloat(((valueLamda-lengthIndicator)/(lengthIndicator-1)).toFixed(4))
        lamda=[...lamda, [valueLamda]]
        lamda=[...lamda, [valueCi]]
        lamda=[...lamda, [dataIR[lengthIndicator-1]]]
        lamda=[...lamda, [parseFloat((valueCi/dataIR[lengthIndicator-1]).toFixed(4))]]
        
        // TAHAPAN TFN FUZZY
        let stageFuzzy:any=[];
        for (let index = 0; index < dataVSub.length; index++) {
            let arrayRow:any=[]
            let dataRow=dataVSub[index].data
            for (let indexRow = 0; indexRow < dataRow.length; indexRow++) {
                let arrayCol:any=[]
                for (let indexCol = 0; indexCol < dataRow[indexRow].length; indexCol++) {
                    let dataSub = dataRow[indexRow][indexCol]
                    const data = dataDecision.find((data: any)=> dataSub in data ) 
                    const length = data?.[dataSub] ? data?.[dataSub]?.length : 0
                    for (let indexData = 0; indexData < length; indexData++) {
                        arrayCol=[...arrayCol, data?.[dataSub]?.[indexData]]
                    }
                    
                }
                arrayRow=[...arrayRow, arrayCol]
                arrayCol=[]
            }
            stageFuzzy=[...stageFuzzy, {
                data: arrayRow,
                'respondentName': dataVSub[index].respondentName,
                'total': lengthIndicator,
                'subVariableCode': subVariable?.code
            }];
            arrayRow=[]
        }
        let multiplicationMatrixStageFuzzy:any=[]
        for (let indexRow = 0; indexRow < (lengthIndicator); indexRow++) {
            let hasil:any=[]
            for (let indexCol = 0; indexCol < (lengthIndicator*3); indexCol++) {
                let nilai=1;
                for (let index = 0; index < stageFuzzy.length; index++) {
                    nilai*=stageFuzzy[index].data[indexRow][indexCol]
                    
                }
                
                hasil=[...hasil, parseFloat(nilai.toFixed(4))]
                nilai=0
                
            }
            multiplicationMatrixStageFuzzy=[...multiplicationMatrixStageFuzzy, hasil]
            hasil=[]
        }

        // AKAR PANGKAT SEBANYAK RESPONDEN
        let squaredRootOfStageFuzzy:any=[]
        let sintesisFuzzy:any=[]
        let sumCol1=0
        let sumCol2=0
        let sumCol3=0
        for (let index = 0; index < multiplicationMatrixStageFuzzy.length; index++) {
            let tmpSquaredRootOf:any=[]
            let value=0
            let sum1=0
            let sum3=0
            let sum2=0
            for (let index2 = 0; index2 < multiplicationMatrixStageFuzzy[index].length; index2++) {
                value = Math.pow(multiplicationMatrixStageFuzzy[index][index2], (1/respondent.length))
                tmpSquaredRootOf=[...tmpSquaredRootOf, parseFloat(value.toFixed(4))]
                if(index2===0 || (index2)%3===0){
                    sum1+=value
                }
                if((index2)%3===1) {
                    sum2+=value
                }
                if((index2)%3===2) {
                    sum3+=value
                }
                value=0
            }
            // Menentukan nilai sintesis fuzzy 
            sumCol1+=sum1
            sumCol2+=sum2
            sumCol3+=sum3
            sintesisFuzzy=[...sintesisFuzzy, [
                parseFloat(sum1.toFixed(4)), 
                parseFloat(sum2.toFixed(4)), 
                parseFloat(sum3.toFixed(4))]
            ]
            squaredRootOfStageFuzzy=[...squaredRootOfStageFuzzy, tmpSquaredRootOf]
            tmpSquaredRootOf=[]
        }
        let sintesisFuzzyLast = [(1/sumCol3).toFixed(4), (1/sumCol2).toFixed(4), (1/sumCol1).toFixed(4)]
        sintesisFuzzy=[
            ...sintesisFuzzy, 
            [sumCol1.toFixed(4), sumCol2.toFixed(4), sumCol3.toFixed(4)],
            [(1/sumCol1).toFixed(4), (1/sumCol2).toFixed(4), (1/sumCol3).toFixed(4)],
            [...sintesisFuzzyLast]
        ]

        // MENDAPATKAN HASIL SI
        let dataExcelI:any=[]
        for (let index = 0; index < sintesisFuzzy.length; index++) {
            let tmpResult:any=[];
            for (let index2 = 0; index2 < sintesisFuzzy[index].length; index2++) {
                let value = (sintesisFuzzy[index][index2]*parseFloat(sintesisFuzzyLast[index2])).toFixed(5)
                tmpResult=[...tmpResult, value]
            }
            dataExcelI=[...dataExcelI, tmpResult]
        }

        // NILAI VEKTOR
        let valueVactor:any=[]
        let valueMin:any=[]
        let total=0
        for (let index = 0; index < lengthIndicator; index++) {
            let tmpValueVactor:any=[]
            for (let index2 = 0; index2 < lengthIndicator; index2++) {
                if(index!==index2){
                    const m1=dataExcelI[index][1]
                    const m2=dataExcelI[index2][1]
                    const l2= dataExcelI[index2][0]
                    const u1= dataExcelI[index][2]
                    const data = formulaVector(m1, m2, l2, u1);
                    tmpValueVactor=[...tmpValueVactor, 
                        [`V (S${index+1} >= S${index2+1})`, data]
                    ]
                }
            }
            const value = tmpValueVactor.sort((a:any,b:any)=>a[1]-b[1]);
            total+= parseFloat((value[0][1]).toFixed(4))
            valueMin=[...valueMin,
                value[0]
            ]
            
            valueVactor=[...valueVactor,
                tmpValueVactor
            ];
        }
        valueMin=[...valueMin, ['Total', parseFloat(total.toFixed(4))]]

        let normalization:any=[];
        for (let index = 0; index < valueMin.length-1; index++) {
            const value = convertFloat(valueMin[index][1]/valueMin[valueMin.length-1][1],4)
            normalization=[...normalization,
                value
            ]
        }
        return {
            fuzzy: dataVSub,
            multiplicationMatrix,
            squaredRootOf,
            eigenVector,
            lamda,
            subVariable: subVariable,
            factor: dataFactor,
            stageFuzzy,
            multiplicationMatrixStageFuzzy,
            squaredRootOfStageFuzzy,
            sintesisFuzzy,
            dataExcelI,
            valueVactor,
            valueMin,
            normalization
        }
    } catch (error) {}
}

const formulaVector = (m1: number, m2:number, l2:number, u1:number) => {
    if(m1>=m2){
        return 1
    }else if(l2>=u1){
        return 0
    }else{
        return parseFloat(((l2-u1)/((m1-u1)-(m2-l2))).toFixed(4))
    }
}

const convertFloat = (value: number, decimal: number) => {
    return parseFloat(value.toFixed(decimal))
}

const download = async (req: Request, res:Response) => {
    res.download('DataIterasi.xlsx')
}

export { InversMatriks, Perangkingan, processKmeans, download }