import {Box, Divider} from "@mui/material";

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
            <Divider
                textAlign="center"
                variant='middle'
                sx={{marginTop: '10px', fontSize: 20}}
            >
                <b>{title}</b>
            </Divider>
            <Box className='AddModifyForm'>
                {children}
            </Box>
        </>
    );
}
