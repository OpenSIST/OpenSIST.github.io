import {Box, Divider, Typography} from "@mui/material";

export const numberInputSx = {
    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
        display: "none",
    },
    "& input[type=number]": {
        MozAppearance: "textfield",
    },
};

export const sectionGridSx = {width: '80%', marginBottom: '10px'};

export function FormSection({children, title}) {
    return (
        <>
            <Box sx={{width: '80%', mx: 'auto', mt: 3, textAlign: 'left'}}>
                <Typography sx={{fontWeight: 600, fontSize: 15, color: 'text.primary'}}>{title}</Typography>
                <Divider sx={{mt: 0.75}}/>
            </Box>
            <Box className='AddModifyForm'>
                {children}
            </Box>
        </>
    );
}
