"use client";
import { createTheme, ThemeOptions, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import Typography from "@/themes/typography";
import CssBaseline from "@mui/material/CssBaseline";

type Props = {
    children: React.ReactNode;
};

export default function ThemeProvider({ children }: Props) {
    const themeTypography = Typography();
    const mode = 'light';
    const themeOptions = {
        typography: themeTypography,
        palette: {
            mode: mode,
            background: {
                default: mode === 'light' ? '#f9f9f9' : '#303030',
                papper: mode === 'light' ? '#f9f9f9' : '#303030',
            },
            error: {
                lighter: '#ffebee',
                light: '#ef5350',
                main: '#d32f2f',
                dark: '#c62828',
            },

        },
        components: {
            MuiAvatar: {
                styleOverrides: {
                    root: {
                        backgroundColor: '#1677ff',
                        width: '20px',
                        height: '20px',
                    },
                },
            },
            MuiSvgIcon: {
                styleOverrides: {
                    root: {
                        color: 'grey.600',
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        backgroundColor: '#FFF',
                        color: '#1677ff',
                        '& .MuiChip-icon': {
                            color: '#1677ff',
                        },
                        '& .MuiChip-deleteIcon': {
                            color: '#1677ff',
                        }
                    }
                }
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        border: '1px solid',
                        borderColor: '#e6ebf1',
                        transition: 'box-shadow 300m',
                        borderRadius: '4px',
                        boxShadow: 'inherit'
                    }
                },
            },
            MuiTable: {
                styleOverrides: {
                    root: {
                        '& .MuiTable-MuiTableCell': {
                            backgroundColor: '#fbfafa'
                        },
                        '& .MuiTable-MuiTableHead': {
                            backgroundColor: '#fbfafa',
                            minHeight: '70px !important',
                        },
                        '& .MuiTable-MuiTableCell-head': {
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                        }
                    }
                }
            },
            MuiTableCell: {
                styleOverrides: {
                    root: {
                    },
                    head: {
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        backgroundColor: '#fbfafa',
                    },
                    body: {
                    },
                },
            },
            MuiTableRow: {
                styleOverrides: {
                    root: {
                        // Stilar för tabellrader
                    },
                    hover: {
                        // Stilar för rader vid hover
                        '&:hover': {
                            backgroundColor: 'red', // Exempel: bakgrundsfärg vid hover
                        },
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: '#fff',
                        boxShadow: 'none',
                        borderBottom: `1px solid rgba(0, 0, 0, 0.12)`
                    },
                },
            },
            MuiCheckbox: {
                styleOverrides: {
                    root: {
                        color: 'grey.600',
                        '&.Mui-checked': {
                            color: '#1890ff',
                        },
                    },
                }
            },

            MuiButton: {
                variants: [
                    {
                        props: { variant: 'contained', color: 'primary' },
                        style: {
                            backgroundColor: '#1677ff',
                            color: '#DEDFFDFF',
                            '&:hover': {
                                backgroundColor: '#0958d9',
                                boxShadow: 'none'
                            },
                            boxShadow: 'none',
                            boxSizing: 'border-box',
                            outline: 0,
                            border: 0,
                            margin: 0
                        },
                    },

                ]
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& MuiOutlinedInput-root.': {
                            '& fieldset': {
                                borderColor: 'grey.600',
                            },
                            '&:hover fieldset': {
                                borderColor: 'grey.700',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#1890ff', // Change border color when focused
                            },
                        },
                    },
                },
            }, MuiOutlinedInput: {
                root: {
                    "& $notchedOutline": {
                        borderColor: "pink"
                    },
                    "&$focused $notchedOutline": {
                        borderColor: "red"
                    },
                    color: "blue",

                    "& .MuiSelect-root ~ $notchedOutline": {
                        borderColor: "green"
                    },
                    "&$focused .MuiSelect-root ~ $notchedOutline": {
                        borderColor: "orange"
                    },
                    "& .MuiSelect-root": {
                        color: "purple"
                    }
                }
            },
            typography: {
                fontFamily: "'Public Sans', sans-serif",
            },
        }
    }

    const theme = createTheme(themeOptions as ThemeOptions);

    return (
        <MuiThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </MuiThemeProvider>
    );
}