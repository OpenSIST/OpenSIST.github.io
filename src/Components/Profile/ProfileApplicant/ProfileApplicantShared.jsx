import {Box, Paper, styled, Typography} from "@mui/material";
import Grid2 from "@mui/material/Grid";

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

export function BaseItemBlock({children, className, checkpointProps, spacing = 0}) {
    return (
        <Grid2 sx={{display: "flex"}} {...getGridProps(checkpointProps)}>
            <Paper
                className={className}
                elevation={0}
                sx={{
                    width: '100%',
                    bgcolor: (theme) => theme.palette.surface,
                    borderRadius: 3,
                }}
            >
                <Grid2 container spacing={spacing}>
                    {children}
                </Grid2>
            </Paper>
        </Grid2>
    )
}

export function BaseListItem({Icon, primary, secondary}) {
    return (
        <Box sx={{display: 'flex', gap: 1.5, py: 1.25, alignItems: 'flex-start'}}>
            <Box sx={{flexShrink: 0, mt: '2px', color: 'primary.main', display: 'flex'}}>
                {Icon}
            </Box>
            <Box sx={{minWidth: 0, flex: 1}}>
                <Typography sx={{fontWeight: 600, color: 'text.primary'}}>
                    {primary}
                </Typography>
                {typeof secondary === 'string' ? (
                    <Typography variant='body2' sx={{color: 'text.secondary', mt: 0.25, whiteSpace: 'pre-wrap'}}>
                        {secondary}
                    </Typography>
                ) : (
                    Object.entries(secondary ?? {}).map(([key, value]) => (
                        <Box key={key} sx={{display: 'flex', gap: 1, mt: 0.25}}>
                            <Typography variant='body2' sx={{color: 'text.secondary', flexShrink: 0}}>
                                {key}
                            </Typography>
                            <Typography variant='body2' sx={{color: 'text.primary', minWidth: 0, overflowWrap: 'anywhere'}}>
                                {value}
                            </Typography>
                        </Box>
                    ))
                )}
            </Box>
        </Box>
    )
}
