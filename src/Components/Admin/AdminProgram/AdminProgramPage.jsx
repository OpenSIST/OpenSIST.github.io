import {Form, Link, redirect, useLoaderData} from "react-router-dom";
import {getQuery, UnivProgramList} from "../../SideBar/SideBar";
import {
    Box, Button,
    Dialog, DialogActions,
    DialogContentText,
    DialogTitle,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemText
} from "@mui/material";
import SearchBar from "../../SideBar/SearchBar/SearchBar";
import React from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import {getPrograms, removeProgram} from "../../../Data/ProgramData";

export default function AdminProgramPage() {
    const loaderData = useLoaderData();
    const univProgramList = loaderData.programs;
    return (
        <Box sx={{m: '10px'}}>
            <SearchBar query={getQuery(loaderData)}/>
            <UnivProgramList univProgramList={univProgramList} ButtonComponent={AdminProgramButton}/>
        </Box>
    )
}

export async function loader({ request }) {
    const url = new URL(request.url);
    const u = url.searchParams.get('u');
    const d = url.searchParams.get('d');
    const m = url.searchParams.get('m');
    const r = url.searchParams.get('r');
    const programs = await getPrograms(true, {u: u, d: d, m: m, r: r});
    return { programs, u, d, m, r };
}

export async function action({ request }) {
    const formData = await request.formData();
    const ProgramID = formData.get('ProgramID');
    await removeProgram(ProgramID);
    return redirect('/admin/programs');
}

export function AdminProgramButton({program}) {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleRemove = async () => {
        await removeProgram(program.ProgramID);
        handleClose();
        window.location.reload();
    }
    return (
        <>
            <ListItem
                className='ProgramItem'
                sx={{pl: "3rem"}}
                key={program.ProgramID}
            >
                <ListItemText primary={program.Program}
                              secondary={program.TargetApplicantMajor.join('/')}/>
                <IconButton onClick={handleOpen}>
                    <DeleteIcon/>
                </IconButton>
            </ListItem>
            <Dialog
                open={open}
                onClose={handleClose}
            >
                <DialogTitle>{`是否要删除${program.ProgramID}项目？`}</DialogTitle>
                <DialogActions>
                    <Button onClick={handleClose}>
                        取消
                    </Button>
                    <Form method="post">
                        <input id="ProgramID" name="ProgramID" hidden defaultValue={program.ProgramID}/>
                        <Button type="submit" onClick={handleClose} autoFocus>
                            确认
                        </Button>
                    </Form>
                </DialogActions>
            </Dialog>
        </>
    )
}