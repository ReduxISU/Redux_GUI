/**
 * ResponsiveAppBar.js
 *
 * This component was directly ripped from the app bar section of mui.com:
 * https://mui.com/material-ui/react-app-bar/
 * * @author Alex Diviney
 */


import * as React from 'react';
import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    Container,
    Button,
    IconButton,
    Tooltip,
} from '@mui/material'; // Grouped all directory imports safely into a named root import
import { Adb as AdbIcon, DarkMode as DarkModeIcon, LightMode as LightModeIcon } from '@mui/icons-material'; // Grouped icons safely
import { useThemeMode } from '../ThemeModeContext';

const pages = ['Home', 'About Us', 'Browse', 'Help', 'Contribute']

const ResponsiveAppBar = () => {
    const { mode, toggleMode } = useThemeMode();

    return (
        // Fixed dark chrome, independent of the page's own theme (which several
        // pages also reuse for their own accent color elsewhere -- e.g. /browse's
        // section cards -- so pulling the banner's color from theme.primary would
        // mean changing that theme to fix the banner also recolors unrelated
        // things on the page) and independent of light/dark mode too -- the
        // banner stays one consistent dark bar in both. color="inherit" so
        // REDUX/AdbIcon/nav buttons below (all color: 'inherit') pick up this
        // fixed text color instead of the ambient theme's primary.contrastText.
        <AppBar position="static" color="inherit" sx={{ bgcolor: '#3F3F46', color: '#fff' }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                    {/**This is the REDUX LOGO Component. */}
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        REDUX
                    </Typography>


                    <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href=""
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >

                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {pages.map((page) => {

                            var currentHref = page.toLowerCase();

                            if (currentHref === "home") {
                                currentHref = "";
                            }
                            else {
                                currentHref = currentHref.replace(' ', '');
                            }
                            return (
                                <Button
                                    key={page}
                                    href={"/" + currentHref}
                                    sx={{ my: 2, color: 'inherit', display: 'block' }}
                                >
                                    {page}
                                </Button>
                            )
                        }
                        )}
                    </Box>

                    <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                        <IconButton onClick={toggleMode} sx={{ color: 'inherit' }} aria-label="Toggle dark mode">
                            {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>

                </Toolbar>
            </Container>
        </AppBar>
    );
};
export default ResponsiveAppBar;
