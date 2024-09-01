import React from 'react';
import * as MaterialIcons from '@mui/icons-material';

export const getIcon = (iconName?: string, color?: string, size?: number | string) => {
    if (iconName) {
        const IconComponent = MaterialIcons[iconName as keyof typeof MaterialIcons];
        const iconStyle = {
            color: color || 'inherit',
            fontSize: size,
        };
        return IconComponent ? <IconComponent style={iconStyle} /> : null;
    }
    return null;
};
