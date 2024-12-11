import csvParser from "csv-parser";
import { Request, Response } from "express";
import fs from 'fs';

export const importData = async (req:Request, res:Response) =>{
    try {
        let results:any=[]
        fs.createReadStream('data/sheet1.csv')
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            console.log({results});
            fs.writeFileSync('data/questionnaire2.json', JSON.stringify(results, null, 2), 'utf8');
        })
    } catch (error) {
        res.status(500).json({
            status:false,
            message: error
        })
    }
}