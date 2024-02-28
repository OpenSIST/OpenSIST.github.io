import {PrimeReactProvider} from "primereact/api";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {getPrograms} from "../../Data/ProgramData";
import {getRecordByProgram} from "../../Data/RecordData";
import {useLoaderData} from "react-router-dom";

export async function loader() {
    const programs = await getPrograms();
    const programIDs = Object.values(programs).map(program => {
        return program.map(p => p.ProgramID);
    }).flat();
    let records = await Promise.all(programIDs.map(async id => await getRecordByProgram(id)));
    records = records.filter(record => Object.keys(record).length > 0);
    records = records.map(record => {
        return Object.values(record)
    }).flat();
    return records;
}

export default function Datapoints() {
    const records = useLoaderData();
    console.log(records)
    return (
        <PrimeReactProvider>
            <DataTable value={records} rowGroupMode="subheader" groupRowsBy="ProgramsID">
                <Column field='ApplicantID' header='申请人'/>
                <Column field='Status' header='申请结果'/>
                <Column field='Final' header='最终去向'/>
                <Column field='TimeLine.Decision' header='结果通知时间'/>
                <Column field='TimeLine.Interview' header='面试时间'/>
                <Column field='TimeLine.Submit' header='网申提交时间'/>
                <Column field='Detail' header='备注、补充说明'/>
            </DataTable>
        </PrimeReactProvider>
    )
}