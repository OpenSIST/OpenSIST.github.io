import {getEmails, moveEmail} from "../../../Data/EmailData";
import {Form, redirect, useLoaderData} from "react-router-dom";
import {
    Accordion,
    AccordionActions,
    AccordionDetails,
    AccordionSummary,
    Box, IconButton, Tooltip,
    Typography,
    useTheme
} from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {grey} from "@mui/material/colors";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

export async function loader() {
    const emails = await getEmails();
    const trashes = await getEmails('trash');
    return {emails, trashes};
}

export async function action({request}) {
    const formData = await request.formData();
    const emailID = formData.get('emailID');
    const actionType = formData.get('button');
    await moveEmail(emailID, actionType);
    return redirect('/admin/emails')
}

export default function AdminEmailPage() {
    const {emails, trashes} = useLoaderData();
    return (
        <>
            <Typography variant="h4" sx={{mb: '10px', alignSelf: 'center'}}>INBOX</Typography>
            <Box sx={{height: "50%", overflow: "auto"}}>
                {
                    Object.entries(emails).map(([emailID, email]) => (
                        <Email key={emailID} email={email} emailID={emailID} Action={InboxAction}/>
                    ))
                }
            </Box>
            <Typography variant="h4" sx={{mb: '10px', alignSelf: 'center'}}>TRASH</Typography>
            <Box sx={{height: "50%", overflow: "auto"}}>
                {
                    Object.entries(trashes).map(([emailID, email]) => (
                        <Email key={emailID} email={email} emailID={emailID} Action={TrashAction}/>
                    ))
                }
            </Box>
        </>
    )
}

function InboxAction({emailID}) {
    return (
        <Tooltip title="Move to trash">
            <Form method='post'>
                <input type='hidden' name='emailID' value={emailID}/>
                <IconButton type='submit' name='button' value='MoveToTrash'>
                    <DeleteIcon/>
                </IconButton>
            </Form>
        </Tooltip>
    )
}

function TrashAction({emailID}) {
    return (
        <Form method='post'>
            <input type='hidden' name='emailID' value={emailID}/>
            <Tooltip title="Move back inbox">
                <IconButton type='submit' name='button' value='MoveBackInbox'>
                    <RestoreFromTrashIcon/>
                </IconButton>
            </Tooltip>
            <Tooltip title="Remove from trash">
                <IconButton type='submit' name='button' value='RemoveFromTrash'>
                    <DeleteForeverIcon/>
                </IconButton>
            </Tooltip>
        </Form>
    )
}

function Email({email, emailID, Action}) {
    const theme = useTheme();
    const darkMode = theme.palette.mode === "dark";
    return (
        <Accordion>
            <AccordionSummary
                expandIcon={<ArrowDropDownIcon/>}
                sx={{
                    bgcolor: darkMode ? grey[700] : grey[200],
                }}
            >
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: "100%",
                }}>
                    <Typography sx={{
                        width: "15%",
                        overflow: "hidden",
                    }}>From: [{email.from.address.split('@')[0]}]</Typography>
                    <Typography sx={{
                        width: "55%",
                        overflow: "hidden",
                    }}>{email.subject}</Typography>
                    <Typography sx={{
                        display: "flex",
                        width: "30%",
                        overflow: "hidden",
                        justifyContent: 'flex-end'
                    }}>{new Date(email.date).toLocaleString('en-US', {
                        hour12: false,
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    })}</Typography>
                </Box>
            </AccordionSummary>
            <AccordionDetails sx={{
                bgcolor: darkMode ? grey[700] : grey[200],
                maxHeight: "300px",
            }}>
                {
                    email.html ?
                        <div style={{maxHeight: '300px', overflow: 'auto'}}>
                            <div dangerouslySetInnerHTML={{__html: email.html}}></div>
                        </div>:
                        <Typography>{email.text}</Typography>
                }
            </AccordionDetails>
            <AccordionActions sx={{
                bgcolor: darkMode ? grey[800] : grey[300],
            }}>
                <Action emailID={emailID}></Action>
            </AccordionActions>
        </Accordion>
    )
}