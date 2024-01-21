import {Form, redirect, useLoaderData} from "react-router-dom";
import {getQuery, UnivProgramList} from "../../SideBar/SideBar";
import {
    Button,
    Dialog, DialogActions, DialogContent,
    DialogTitle,
    IconButton,
    ListItem,
    ListItemText, TextField, Typography, useTheme
} from "@mui/material";
import SearchBar from "../../SideBar/SearchBar/SearchBar";
import React, {useState} from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import {getPrograms, modifyProgramID, removeProgram} from "../../../Data/ProgramData";
import {Edit} from "@mui/icons-material";
import {grey} from "@mui/material/colors";

export async function loader({request}) {
    const url = new URL(request.url);
    const u = url.searchParams.get('u');
    const d = url.searchParams.get('d');
    const m = url.searchParams.get('m');
    const r = url.searchParams.get('r');
    const programs = await getPrograms(true, {u: u, d: d, m: m, r: r});
    return {programs, u, d, m, r};
}

export async function action({request}) {
    const formData = await request.formData();
    const ProgramID = formData.get('ProgramID');
    const Univ = ProgramID.split('@')[1];
    const actionType = formData.get('button');
    if (actionType === 'remove') {
        await removeProgram(ProgramID);
    } else if (actionType === 'modify') {
        const NewProgramID = formData.get('NewProgramID') + '@' + Univ;
        const requestBody = {
            ProgramID: ProgramID,
            NewProgramID: NewProgramID
        }
        await modifyProgramID(requestBody);
    }

    return redirect('/admin/programs');
}

export default function AdminProgramPage() {
    const loaderData = useLoaderData();
    const univProgramList = loaderData.programs;
    return (
        <>
            <Typography variant='h4' sx={{mb:'10px', alignSelf:"center"}}>Program Admin Panel</Typography>
            <SearchBar query={getQuery(loaderData)}/>
            <UnivProgramList univProgramList={univProgramList} ButtonComponent={AdminProgramButton}/>
        </>
    )
}


export function AdminProgramButton({program}) {
    const theme = useTheme();
    const darkMode = theme.palette.mode === 'dark';
    const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
    const [openModifyDialog, setOpenModifyDialog] = useState(false);
    const [newProgramID, setNewProgramID] = useState(program.ProgramID);
    const handleOpenRemoveDialog = () => setOpenRemoveDialog(true);
    const handleCloseRemoveDialog = () => setOpenRemoveDialog(false);
    const handleOpenModifyDialog = () => setOpenModifyDialog(true);
    const handleCloseModifyDialog = () => setOpenModifyDialog(false);
    return (
        <>
            <ListItem
                className='ProgramItem'
                sx={{
                    pl: "3rem",
                    "&::before": {
                        background: darkMode ? grey[800] : grey[300],
                    },
                }}
                key={program.ProgramID}
            >
                <ListItemText primary={program.Program}
                              secondary={program.TargetApplicantMajor.join('/')}/>
                <IconButton onClick={handleOpenModifyDialog}>
                    <Edit/>
                </IconButton>
                <IconButton onClick={handleOpenRemoveDialog}>
                    <DeleteIcon/>
                </IconButton>
            </ListItem>
            <Dialog
                open={openRemoveDialog}
                onClose={handleCloseRemoveDialog}
            >
                <DialogTitle>{`是否要删除${program.ProgramID}项目？`}</DialogTitle>
                <DialogActions>
                    <Button onClick={handleCloseRemoveDialog} autoFocus>
                        取消
                    </Button>
                    <Form method="post">
                        <input id="ProgramID" name="ProgramID" hidden defaultValue={program.ProgramID}/>
                        <Button name='button' value='remove' type="submit" onClick={handleCloseRemoveDialog}>
                            确认
                        </Button>
                    </Form>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openModifyDialog}
                onClose={handleCloseModifyDialog}
            >
                <DialogTitle>{`修改${program.ProgramID}的项目名称`}</DialogTitle>
                <Form method="post">
                    <DialogContent>
                        <input id="ProgramID" name="ProgramID" hidden defaultValue={program.ProgramID}/>
                        <TextField
                            id="NewProgramID"
                            name="NewProgramID"
                            label="新项目名称"
                            variant="standard"
                            value={newProgramID.split('@')[0]}
                            onChange={(e) => setNewProgramID(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseModifyDialog} autoFocus>
                            取消
                        </Button>
                        <Button type='submit' name='button' value='modify' onClick={handleCloseModifyDialog}>
                            确认
                        </Button>
                    </DialogActions>
                </Form>
            </Dialog>
        </>
    )
}