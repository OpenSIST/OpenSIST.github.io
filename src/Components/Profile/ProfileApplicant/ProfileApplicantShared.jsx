import {Box, ListItem, ListItemIcon, ListItemText, Paper, styled, Typography} from "@mui/material";
import Grid2 from "@mui/material/Grid";
import {BoldTypography} from "../../common";

export const ContentCenteredGrid = styled(Grid2)(() => ({
    display: 'flex',
    alignItems: 'center',
}));

function getGridProps(checkpointProps = {}) {
    const {xs, sm, md, lg, xl, size, ...rest} = checkpointProps;
    const legacySize = Object.fromEntries(
        Object.entries({xs, sm, md, lg, xl}).filter(([, value]) => value !== undefined)
    );
    const hasLegacySize = Object.keys(legacySize).length > 0;
    return {
        ...rest,
        ...(size || hasLegacySize ? {size: size ?? legacySize} : {}),
    };
}

export function BaseItemBlock({children, className, checkpointProps, spacing = 0, elevation = 2}) {
    return (
        <Grid2 sx={{display: "flex"}} {...getGridProps(checkpointProps)}>
            <Paper className={className} elevation={elevation}>
                <Grid2 container spacing={spacing}>
                    {children}
                </Grid2>
            </Paper>
        </Grid2>
    )
}

export function BaseListItem({Icon, primary, secondary}) {
    return (
        <ListItem alignItems="flex-start" sx={{gap: '1rem'}}>
            <ListItemIcon sx={{minWidth: '2rem'}}>
                {Icon}
            </ListItemIcon>
            <ListItemText
                primary={
                    <BoldTypography variant='h6' sx={{
                        color: (theme) => theme.palette.mode === 'dark' ? "#fff" : "#000",
                    }}>
                        {primary}
                    </BoldTypography>
                }
                secondary={
                    <Box component='span' sx={{display: 'flex', flexDirection: 'column'}}>
                        {typeof secondary === 'string' ?
                            <Typography component='span'>
                                {secondary}
                            </Typography> :
                            Object.entries(secondary ?? {}).map(([key, value]) => {
                                return (
                                    <Typography component='span' key={key}>
                                        {`${key}：${value}`}
                                    </Typography>
                                )
                            })
                        }
                    </Box>
                }
            />
        </ListItem>
    )
}
