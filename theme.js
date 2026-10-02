"use client";
import { Roboto } from "next/font/google";
import { createTheme } from "@mui/material/styles";
import { bootstrapCompatibilityTheme } from "@articles-media/articles-dev-box/bootstrapCompatibilityTheme";

const roboto = Roboto({
    weight: ["300", "400", "500", "700"],
    subsets: ["latin"],
    display: "swap",
});

export function createAppTheme(mode = "dark") {
    return createTheme({
        cssVariables: true,
        palette: {
            mode,
            primary: {
                main: "#f9edcd",
            },
            secondary: {
                main: "#adafb3",
            },
        },
        // Keep Battle Trap's existing layout thresholds during the MUI migration.
        breakpoints: {
            values: { xs: 0, sm: 576, md: 768, lg: 992, xl: 1200, xxl: 1400 },
        },
        typography: {
            fontFamily: roboto.style.fontFamily,
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: (muiTheme) => ({
                    ...bootstrapCompatibilityTheme.MuiCssBaseline.styleOverrides(
                        muiTheme,
                    ),
                    i: { marginRight: "0.2rem" },
                    button: {
                        whiteSpace: "pre",
                        fontSize: "0.7rem !important",
                    },
                }),
            },
            MuiAlert: {
                styleOverrides: {
                    root: {
                        variants: [
                            {
                                props: { severity: "info" },
                                style: {
                                    backgroundColor: "#60a5fa",
                                },
                            },
                        ],
                    },
                },
            },
        },
    });
}

const theme = createAppTheme();

export default theme;
