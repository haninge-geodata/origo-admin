import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { getMdiIcon } from "@/utils/helpers/iconMdiHelper";
import { getIcon } from "@/utils/helpers/iconHelper";

import { Box } from '@mui/material';

interface HoverCardProps {
    id?: string;
    title?: string;
    icon?: string;
    iconColor?: string;
    cardColor?: string;
    onEditClick?: (id: string) => void;
    onDeleteClick?: (id: string) => void;
    size?: string;
}

interface Size {
    width: number;
    height: number;
    iconSize: number;
    fontSize: string;
    editAndDeleteIconSize: number;
}

const getHoverCardSize = (size: string) => {
    if (size == "listItem") {
        return {
            width: 300,
            height: 50,
            iconSize: 1,
            editAndDeleteIconSize: 10,
            fontSize: '1.2rem'
        } as Size;
    }
    return {
        width: 332,
        height: 92,
        iconSize: 2.6,
        editAndDeleteIconSize: 25,
        fontSize: '1.5rem'

    } as Size;
}


const HoverCard = React.forwardRef<HTMLDivElement, HoverCardProps & React.HTMLAttributes<HTMLDivElement>>((
    { id, title, icon, iconColor, onEditClick, onDeleteClick, cardColor = '#1677ff', size = 'normal', ...props },
    ref
) => {
    const cardSize = getHoverCardSize(size);
    const IconComponent = getMdiIcon(icon, iconColor || 'white', cardSize.iconSize);
    const EditComponent = getIcon('Create', iconColor || 'white', cardSize.editAndDeleteIconSize);
    const DeleteComponent = getIcon('DeleteOutline', iconColor || 'white', cardSize.editAndDeleteIconSize);

    return (
        <Card
            ref={ref}
            {...props}
            sx={{
                width: cardSize.width,
                height: cardSize.height,
                position: 'relative',
                '&:hover': {
                    '& .MuiSvgIcon-root, & .MuiTypography-root': { opacity: 0.8 },
                    '& .MuiSvgIcon-root.primary': { transform: 'scale(1.2)' }
                }
            }}>
            <CardContent sx={{
                backgroundColor: cardColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '100%',
                position: 'relative',
            }}>

                {icon && <Box component="div" sx={{
                    position: 'absolute',
                    left: 6,
                    top: '73%',
                    borderRadius: '50%',
                    border: '2px solid white',
                    transform: 'translateY(-40%) scale(1.5)',
                    padding: '5px',
                    opacity: 0.3,
                    zIndex: 0,
                }}>
                    {IconComponent}
                </Box>}
                <Box component="div" sx={{ pl: 12, pt: 2, zIndex: 1 }}>
                    {title && (
                        <Typography sx={{ fontSize: cardSize.fontSize, opacity: 0.5, color: 'white' }} variant="h4">
                            {title}
                        </Typography>
                    )}
                </Box>
                <Box component="div" sx={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-end'
                }}>
                    {onEditClick && <Box component="div" onClick={() => onEditClick && onEditClick(id!)}
                        sx={{ mt: '10px', opacity: 0.7, '&:hover': { opacity: 1, transform: 'scale(1.1)', cursor: 'pointer' } }}>
                        {EditComponent}
                    </Box>}
                    {onDeleteClick && <Box component="div" onClick={() => onDeleteClick && onDeleteClick(id!)}
                        sx={{ opacity: 0.7, '&:hover': { opacity: 1, transform: 'scale(1.1)', cursor: 'pointer' } }}>
                        {DeleteComponent}
                    </Box>}
                </Box>
            </CardContent>
        </Card >
    );
});

export default HoverCard;