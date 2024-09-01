import React from 'react';
import Icon from '@mdi/react';
import * as mdiIcons from '@mdi/js';

export const getMdiIcon = (iconName?: string, color?: string, size?: string | number) => {
    if (iconName) {
        const iconPath = mdiIcons[iconName as keyof typeof mdiIcons];
        const iconSize = typeof size === 'number' ? size : 1;

        return iconPath ? (
            <Icon path={iconPath} size={iconSize} color={color} />
        ) : null;
    }
    return null;
};
