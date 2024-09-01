import React, { useState } from 'react';
import { List, ListItemButton, ListItemText, Collapse, IconButton } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import { GroupDto } from "@/shared/interfaces/dtos";

interface NestedGroupProps {
    group: GroupDto;
    level?: number;
    onDeleteGroup: (groupName: string) => void; // Callback för att hantera borttagning
}

export const NestedGroup: React.FC<NestedGroupProps> = ({ group, level = 0, onDeleteGroup }) => {
    const [open, setOpen] = useState<boolean>(false);

    const handleToggle = () => {
        setOpen(!open);
    };

    const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>, groupName: string) => {
        e.stopPropagation();
        onDeleteGroup(groupName);
    };

    return (
        <>
            <ListItemButton onClick={handleToggle} sx={{ pl: level * 2 }}>
                <ListItemText primary={group.title} />
                {group.groups?.length ? open ? <ExpandLess /> : <ExpandMore /> : null}
                <IconButton onClick={(e) => handleDeleteClick(e, group.name)} size="small">
                    <DeleteIcon />
                </IconButton>
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    {group.groups?.map((subGroup, index) => (
                        <NestedGroup key={index} group={subGroup} level={level + 1} onDeleteGroup={onDeleteGroup} />
                    ))}
                </List>
            </Collapse>
        </>
    );
};