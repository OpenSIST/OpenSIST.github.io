import {getEmailBody, getEmailList, moveEmail} from "../../../Data/EmailData";
import {Form, redirect, useLoaderData} from "react-router-dom";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box, ButtonGroup, Checkbox, IconButton, Tooltip,
    Typography,
    useTheme
} from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {grey} from "@mui/material/colors";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import {useState} from "react";
import {TimeTick2String} from "../../../Data/Common";

export async function loader() {
    const inboxes = await getEmailList('inbox');
    const trashes = await getEmailList('trash');
    return {inboxes, trashes};
}

export async function action({request}) {
    const formData = await request.formData();
    const emailIDs = formData.get('emailIDs').split(',');
    const actionType = formData.get('button');
    await moveEmail(emailIDs, actionType);
    // emailIDs.split(',').map(async (emailID) => {
    //     await moveEmail(emailID, actionType);
    // })
    return redirect('/admin/emails')
}

export default function AdminEmailPage() {
    const {inboxes, trashes} = useLoaderData();
    return (
        <>
            <EmailBox type="INBOX" emails={inboxes} Action={InboxAction}/>
            <EmailBox type="TRASH" emails={trashes} Action={TrashAction}/>
        </>
    )
}

function EmailBox({type, emails, Action}) {
    const [selectEmails, setSelectEmails] = useState([]);
    const handleSelectAllEmails = (event) => {
        if (event.target.checked) {
            setSelectEmails(Object.keys(emails));
        } else {
            setSelectEmails([]);
        }
    }
    return (
        <>
            <Typography variant="h4" sx={{mb: '10px', alignSelf: 'center'}}>{type}</Typography>
            <Form method="post" style={{height: "40%", overflow: "auto"}}>
                <input hidden id='emailIDs' name='emailIDs' defaultValue={selectEmails.join(',')}></input>
                <ButtonGroup>
                    <Tooltip title="Select All">
                        <Checkbox
                            checked={selectEmails.length === Object.keys(emails).length && selectEmails.length !== 0}
                            onClick={handleSelectAllEmails}
                        />
                    </Tooltip>
                    <Action/>
                </ButtonGroup>
                <Box
                    // sx={{height: "100%", overflow: "auto"}}
                >
                    {
                        Object.entries(emails).map(([emailID, email]) => (
                            <Email
                                key={emailID}
                                email={email}
                                emailID={emailID}
                                selectEmails={selectEmails}
                                setSelectEmails={setSelectEmails}
                            />
                        ))
                    }
                </Box>
            </Form>
        </>
    )
}


function Email({email, emailID, selectEmails, setSelectEmails}) {
    const theme = useTheme();
    const darkMode = theme.palette.mode === "dark";
    const [emailContent, setEmailContent] = useState({html: null, text: null});
    const handleSelectEmail = (event) => {
        if (event.target.checked) {
            setSelectEmails([...selectEmails, emailID]);
        } else {
            setSelectEmails(selectEmails.filter((id) => id !== emailID));
        }
    }
    const handleAccordionClick = async () => {
        if (emailContent.html === null) {
            setEmailContent(await getEmailBody(emailID));
        }
    }
    return (
        <Box sx={{display: 'flex'}}>
            <Box sx={{display: 'flex', alignItems: 'flex-start'}}>
                <Checkbox
                    checked={selectEmails.includes(emailID)}
                    onClick={handleSelectEmail}
                />
            </Box>
            <Accordion sx={{width: '100%'}} disableGutters>
                <AccordionSummary
                    expandIcon={<ArrowDropDownIcon/>}
                    sx={{
                        bgcolor: darkMode ? grey[800] : grey[200],
                    }}
                    onClick={handleAccordionClick}
                >

                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: "100%",
                    }}>
                        <Typography sx={{
                            width: "15%",
                        }}>From: [{email.from.split('@')[0]}]</Typography>
                        <Typography sx={{
                            width: "55%",
                        }}>{email.subject}</Typography>
                        <Typography sx={{
                            display: "flex",
                            width: "30%",
                            justifyContent: 'flex-end'
                        }}>{
                            // TimeTick2String(email.time, {
                            //     hour12: false,
                            //     year: 'numeric',
                            //     month: '2-digit',
                            //     day: '2-digit',
                            //     hour: '2-digit',
                            //     minute: '2-digit',
                            //     second: '2-digit'
                            // })
                            new Date(email.time).toDateString()
                                .toLocaleString('en-US', {
                                        hour12: false,
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                    }
                                )
                        }</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails sx={{
                    bgcolor: darkMode ? grey[600] : grey[200],
                    maxHeight: "300px",
                }}>
                    <div style={{maxHeight: '300px', overflow: 'auto'}}>
                        {
                            emailContent.html ?
                                <div dangerouslySetInnerHTML={{__html: emailContent.html}}></div> :
                                <Typography sx={{maxHeight: "300px"}}>{emailContent.text}</Typography>
                        }
                    </div>
                </AccordionDetails>
            </Accordion>
        </Box>
    )
}

function InboxAction() {
    return (
        <Tooltip title="Move to trash">
            <IconButton type='submit' name='button' value='MoveToTrash'>
                <DeleteIcon/>
            </IconButton>
        </Tooltip>
    )
}

function TrashAction() {
    return (
        <>
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
        </>
    )
}