import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import Image from 'next/image';
import { Typography } from '@mui/material';
import envStore from "@/stores/Environment";

interface LogoProps {
    onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({ onClick }) => {
    const [logo, setLogo] = useState<string>('');
    const [logoWidth, setLogoWidth] = useState<number>(0);
    const [logoHeight, setLogoHeight] = useState<number>(0);

    useEffect(() => {
        async function fetchLogoData() {
            const fetchedLogo = await envStore("LOGO");
            const width = await envStore("LOGO_WIDTH");
            const height = await envStore("LOGO_HEIGHT");
            if (fetchedLogo) {
                setLogo(fetchedLogo);
                setLogoWidth(Number(width));
                setLogoHeight(Number(height));
            }
        }

        fetchLogoData();
    }, []);

    const theme = useTheme();

    return (
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: 20, marginTop: 14, cursor: 'pointer' }} onClick={onClick}>
            {(logo && logoWidth && logoHeight) && (
                <Image src={logo} alt="Logo" width={logoWidth} height={logoHeight} />
            )}
            <Typography
                variant="h6"
                component="h1"
                sx={{
                    color: theme.palette.grey[600],
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    ml: 2
                }}>
                Origo Admin
            </Typography>
        </div>
    );
};

export default Logo;
