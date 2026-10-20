import React, {useState} from "react";
import {Form} from "react-router-dom";
import {Box, IconButton, InputAdornment, MenuItem, Paper, TextField, Typography} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {OpenSIST} from "../common";
import LightLogo from "../icons/light.svg?react";
import DarkLogo from "../icons/dark.svg?react";

export function AuthCard({children, ...formProps}) {
    return (
        <Box sx={{
            minHeight: 'calc(100dvh - 60px)',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
            py: {xs: 2, sm: 4},
        }}>
            <Paper
                component={Form}
                elevation={0}
                {...formProps}
                sx={{
                    width: '100%',
                    maxWidth: 430,
                    boxSizing: 'border-box',
                    bgcolor: (theme) => theme.palette.surface,
                    borderRadius: 3,
                    p: {xs: 3, sm: 4},
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    // Use CSS pixels: the mobile root font is smaller than 16px.
                    '@media (max-width:900px), (pointer: coarse)': {
                        '& input, & textarea, & .MuiSelect-select': {fontSize: 'max(16px, 1em)'},
                    },
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
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5}}>
                <Box aria-hidden='true' sx={{width: 48, height: 48, '& svg': {width: '100%', height: '100%'},
                    '& .light-logo': {display: (theme) => theme.palette.mode === 'dark' ? 'none' : 'block'},
                    '& .dark-logo': {display: (theme) => theme.palette.mode === 'dark' ? 'block' : 'none'},
                }}>
                    <LightLogo className='light-logo'/>
                    <DarkLogo className='dark-logo'/>
                </Box>
                <OpenSIST props={{variant: 'h4'}} sx={{color: (theme) => theme.palette.mode === 'dark' ? '#80b3fa' : '#004098'}}/>
            </Box>
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
