import React, {useState} from "react";
import {Form} from "react-router-dom";
import {Box, IconButton, InputAdornment, MenuItem, Paper, TextField, Typography} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {OpenSIST} from "../common";

export function AuthCard({children, ...formProps}) {
    return (
        <Box sx={{
            minHeight: 'calc(100vh - 60px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
            py: 4,
        }}>
            <Paper
                component={Form}
                elevation={0}
                {...formProps}
                sx={{
                    width: '100%',
                    maxWidth: 430,
                    bgcolor: (theme) => theme.palette.surface,
                    borderRadius: 3,
                    p: {xs: 3, sm: 4},
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}
            >
                {children}
            </Paper>
        </Box>
    );
}

export function AuthHeader({subtitle}) {
    return (
        <Box sx={{textAlign: 'center', mb: 0.5}}>
            <OpenSIST props={{variant: 'h4'}} sx={{display: 'inline-block', color: 'text.primary'}}/>
            <Typography sx={{color: 'text.secondary', mt: 0.75, fontSize: 14}}>{subtitle}</Typography>
        </Box>
    );
}

const SUFFIXES = ['@shanghaitech.edu.cn', '@alumni.shanghaitech.edu.cn'];

export function EmailSuffixField({value, onChange, suffix, onSuffixChange}) {
    return (
        <>
            <TextField
                fullWidth
                size='small'
                variant='outlined'
                label='上科大邮箱'
                id='username'
                name='username'
                value={value}
                onChange={onChange}
                required
            />
            <TextField
                select
                fullWidth
                size='small'
                variant='outlined'
                label='邮箱后缀'
                id='suffix'
                name='suffix'
                value={suffix}
                onChange={onSuffixChange}
            >
                {SUFFIXES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
        </>
    );
}

export function PasswordField({label, ...props}) {
    const [show, setShow] = useState(false);
    return (
        <TextField
            fullWidth
            size='small'
            variant='outlined'
            type={show ? 'text' : 'password'}
            label={label}
            {...props}
            InputProps={{
                endAdornment: (
                    <InputAdornment position='end'>
                        <IconButton size='small' edge='end' aria-label={show ? '隐藏密码' : '显示密码'} onClick={() => setShow((s) => !s)}>
                            {show ? <VisibilityOff fontSize='small'/> : <Visibility fontSize='small'/>}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    );
}
