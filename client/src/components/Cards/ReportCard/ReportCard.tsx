import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import { getIcon } from "@/utils/helpers/iconHelper";
import Link from 'next/link';
import { Box } from '@mui/material';

interface ReportCardProps {
    title?: string;
    count?: string | number;
    icon: string;
    iconColor?: string;
    url?: string;
}

export default function ReportCard({ title, count, icon, iconColor, url }: ReportCardProps) {
    const IconComponent = getIcon(icon, iconColor, 50);

    const cardContent = (
        <CardContent sx={{ height: '100%' }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    height: '100%'
                }}
            >
                <Box sx={{ mb: { xs: 2, sm: 0 } }}>
                    {title && (
                        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                            {title}
                        </Typography>
                    )}
                    {count && (
                        <Typography sx={{ mb: 1.5 }} color="text.primary" variant="h4">
                            {count}
                        </Typography>
                    )}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, width: { xs: '100%', sm: 'auto' } }}>
                    {IconComponent}
                </Box>
            </Box>
        </CardContent>
    );

    const cardProps = {
        sx: {
            minWidth: 200,
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }
    };

    if (url) {
        return (
            <Card {...cardProps}>
                <Link href={url} passHref style={{ textDecoration: 'none', color: 'inherit', height: '100%' }}>
                    <CardActionArea sx={{ height: '100%' }}>
                        {cardContent}
                    </CardActionArea>
                </Link>
            </Card>
        );
    }

    return (
        <Card {...cardProps}>
            {cardContent}
        </Card>
    );
}