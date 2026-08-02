import React, { useContext } from 'react';
import Box from '@mui/material/Box';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import { Typography,Card } from '@mui/material';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';


export function No_Viz_Svg({ niceProblemName }) {
    return (

        <Box
        >

            <Card variant="outlined"
                sx={{
                    bgcolor: 'primary.lGray',
                    boxShadow: 1,
                    borderRadius: 2,
                    p: 2,
                    minWidth: 300
                }}
            >
                <ErrorOutlineIcon
                    fontSize="large"
                >
                </ErrorOutlineIcon>


                {/* <h1 style={{color: "orange"}}> No visualization is Currently implemented!</h1>
                <p>No visualization is Currently Implemented!</p> */}
                <Typography variant="h4" component="h4" style={{ color: 'black', fontWeight: 'normal', textAlign: 'center' }} >
                    The {niceProblemName} visualization has not been implemented yet
                </Typography>
            </Card>

        </Box>
    )
}



export function No_Reduction_Viz_Svg({ niceReductionName }) {
    return (

        <Box>
            <Card variant="outlined"
                sx={{
                    bgcolor: 'primary.lGray',
                    boxShadow: 1,
                    borderRadius: 2,
                    p: 2,
                    minWidth: 300
                }}
            >
                <ErrorOutlineIcon fontSize="large"></ErrorOutlineIcon>
                <Typography
                    variant="h4"
                    component="h4"
                    style={{
                        color: 'black',
                        fontWeight: 'normal',
                        textAlign: 'center'
                    }}
                >The {niceReductionName ?? "chosen reduction"} visualization has not been implemented yet</Typography>
            </Card>
        </Box>
    )
}

/**
 * Shown when a declared `visualizationType` has no renderer registered for it (the "no
 * renderer" case, distinct from a renderer that crashed -- see Viz_Render_Error_Svg). Names the
 * TYPE, not the problem or reduction, since that's the actual missing piece; `niceProblemName`
 * / `niceReductionName` are shown as extra context when available.
 */
export function No_Renderable_Viz_Svg({ niceProblemName, niceReductionName, visualizationType }) {
    const contextName = niceReductionName ?? niceProblemName;
    return (
        <Box>
            <Card variant="outlined"
                sx={{
                    bgcolor: 'primary.lGray',
                    boxShadow: 1,
                    borderRadius: 2,
                    p: 2,
                    minWidth: 300
                }}
            >
                <ErrorOutlineIcon fontSize="large"></ErrorOutlineIcon>
                <Typography
                    variant="h4"
                    component="h4"
                    style={{
                        color: 'black',
                        fontWeight: 'normal',
                        textAlign: 'center'
                    }}
                >
                    {contextName ? `${contextName} declares` : "This visualization declares"} type
                    &quot;{visualizationType || "unknown"}&quot;, which this interface can&apos;t render.
                </Typography>
            </Card>
        </Box>
    )
}

/**
 * Shown when a visualization DOES have a registered renderer, but that renderer threw while
 * rendering -- the "renderer crashed" case, distinct from "no renderer" (No_Renderable_Viz_Svg).
 * Previously both cases were reported identically as "not implemented yet", which hid real
 * bugs behind a missing-feature message.
 */
export function Viz_Render_Error_Svg({ niceProblemName, niceReductionName, visualizationType }) {
    const contextName = niceReductionName ?? niceProblemName;
    return (
        <Box>
            <Card variant="outlined"
                sx={{
                    bgcolor: 'primary.lGray',
                    boxShadow: 1,
                    borderRadius: 2,
                    p: 2,
                    minWidth: 300
                }}
            >
                <ErrorOutlineIcon fontSize="large"></ErrorOutlineIcon>
                <Typography
                    variant="h4"
                    component="h4"
                    style={{
                        color: 'black',
                        fontWeight: 'normal',
                        textAlign: 'center'
                    }}
                >
                    {contextName ? `The ${contextName}` : "This"} visualization
                    (type &quot;{visualizationType || "unknown"}&quot;) failed to render. Check the console
                    for details.
                </Typography>
            </Card>
        </Box>
    )
}