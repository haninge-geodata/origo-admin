import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import { getIcon } from "@/utils/helpers/iconHelper";
import Link from 'next/link';

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
        <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    {title && <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                        {title}
                    </Typography>}
                    {count && <Typography sx={{ mb: 1.5 }} color="text.primary" variant="h4">
                        {count}
                    </Typography>}
                </div>
                {IconComponent}
            </div>
        </CardContent>
    );

    if (url) {
        return (
            <Card sx={{ minWidth: 275 }}>
                <Link href={url} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                    <CardActionArea>
                        {cardContent}
                    </CardActionArea>
                </Link>
            </Card>
        );
    }

    return (
        <Card sx={{ minWidth: 275 }}>
            {cardContent}
        </Card>
    );
}