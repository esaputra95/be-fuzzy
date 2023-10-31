import { dataDecision, dataIR } from "#root/helpers/dataDefault";
import { errorType } from "#root/helpers/errorType";
import Model from "#root/services/PrismaService";
import { Request, Response } from "express";

const InversMatriks = async (req:Request, res:Response) => {
    try {
        const query = req.query;

        const count = await Model.knowledgeManagement.count({
            where:{
                subVariableId: parseInt(query.subVariableId+''),
                factorId: parseInt(query.factorId+'')
            }
        })

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
        for (let indexResp = 0; indexResp < respondent.length; indexResp++) {
            let arrayData:any=[]
            const question = respondent[indexResp].questionnaires
            
            let reduce=1;
            for (let index = 0; index < question.length; index++) {
                let value = parseInt(question[index].value+'') > 0 ? parseInt(question[index].value+'') : parseInt(question[index].value+'')*-1    
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
           
            dataVSub=[
                ...dataVSub,
                {
                    'data':[...newData],
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
                if(index2===0 || (index2+1)%3===0){
                    sum1+=value
                }
                if((index2+1)%3===1) {
                    sum2+=value
                }
                if((index2+1)%3===2) {
                    sum3+=value
                }
                value=0
            }
            // Menentukan nilai sintesis fuzzy 
            sumCol1+=sum1
            sumCol2+=sum2
            sumCol3+=sum3
            sintesisFuzzy=[...sintesisFuzzy, [parseFloat(sum1.toFixed(4)), parseFloat(sum2.toFixed(4)), parseFloat(sum3.toFixed(4))]]
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
        let resultSI:any=[]
        for (let index = 0; index < sintesisFuzzy.length; index++) {
            let tmpResult:any=[];
            for (let index2 = 0; index2 < sintesisFuzzy[index].length; index2++) {
                let value = (sintesisFuzzy[index][index2]*parseFloat(sintesisFuzzyLast[index2])).toFixed(5)
                tmpResult=[...tmpResult, value]
            }
            resultSI=[...resultSI, tmpResult]
        }

        res.status(200).json({
            status: true,
            message: "successful in getting factor data",
            data: {
                info:{
                    page: 0,
                    limit: 0,
                    total: 0
                },
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
                resultSI
            }
        })
    } catch (error) {
        console.log({error});
        
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

export { InversMatriks }