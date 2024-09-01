import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { ReactElement } from "react";
import { Box, CardHeader, Divider } from '@mui/material';

type props = {
    children?: ReactElement | ReactElement[],
    style?: React.CSSProperties;
    title?: React.ReactNode | string;
}

export default function MainCard({ children, style, title }: props) {
    const headerSX = {
        p: 2.5,
        '& .MuiCardHeader-action': { m: '0px auto', alignSelf: 'center' },
    };
    const contentStyle = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        height: '100%',
    };

    return (
        <Card sx={style}>
            {title && title !== '' && (
                <Box component='div' sx={{ height: '54px' }}>
                    <CardHeader sx={headerSX} titleTypographyProps={{ variant: 'subtitle1' }} title={title}>
                    </CardHeader>
                    <Divider />
                </Box>
            )}
            <CardContent sx={contentStyle}>
                {children}
            </CardContent>
        </Card>
    );
}