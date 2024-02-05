import {Form, redirect} from "react-router-dom";
import {addModifyApplicant} from "../../../Data/ApplicantData";
import {Dialog, DialogContent, DialogTitle, Typography} from "@mui/material";
import React, {useState} from "react";

export async function action({request}) {
    const formData = await request.formData();
    const ApplicantID = formData.get('ApplicantID');
    const Gender = formData.get('Gender');
    const CurrentDegree = formData.get('CurrentDegree');
    const ApplicationYear = formData.get('ApplicationYear');
    const Major = formData.get('Major');
    const GPA = formData.get('GPA');
    const Ranking = formData.get('Ranking');
    const GRE = formData.get('GRE');
    const EnglishProficiency = formData.get('EnglishProficiency');
    const Exchange = formData.get('Exchange');
    const Publication = formData.get('Publication');
    const Research = formData.get('Research');
    const Internship = formData.get('Internship');
    const Recommendation = formData.get('Recommendation');
    const Contact = formData.get('Contact');
    const requestBody = {
        'newApplicant': false,
        'content': {
            'ApplicantID': ApplicantID,
            'Gender': Gender,
            'CurrentDegree': CurrentDegree,
            'ApplicationYear': ApplicationYear,
            'Major': Major,
            'GPA': GPA,
            'Ranking': Ranking,
            'GRE': GRE,
            'EnglishProficiency': EnglishProficiency,
            'Exchange': Exchange,
            'Publication': Publication,
            'Research': Research,
            'Internship': Internship,
            'Recommendation': Recommendation,
            'Contact': Contact
        }
    };
    await addModifyApplicant(requestBody)
    return redirect(`/profile`);
}

export function AddModifyApplicant() {
    const [openDialog, setOpenDialog] = useState(false);
    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => setOpenDialog(false);
    return (
        <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
        >
            <DialogTitle variant="h4" sx={{alignSelf: 'center'}}>编辑信息</DialogTitle>
            <DialogContent>
                <Form method="post"
                      style={{display: 'flex', flexDirection: 'column'}}
                >

                </Form>
            </DialogContent>
        </Dialog>
    )
}