import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, List, ListItem, Box, Checkbox } from "@mui/material";
import React, { useState } from "react";

interface OverwriteMediaDialogProps {
    title: string;
    mediaToOverWrite: Array<File>;
    onClose: () => void;
    onSubmit: (mediaToOverwrite: Array<File>) => void;
}

export default function OverwriteMediaDialog({ onClose, onSubmit, title, mediaToOverWrite }: OverwriteMediaDialogProps) {
    const [checkedInstances, setCheckedInstances] = useState<string[]>([]);

    const handleToggle = (filename: string) => {
        const currentIndex = checkedInstances.indexOf(filename);
        const newChecked = [...checkedInstances];

        if (currentIndex === -1) {
            newChecked.push(filename);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setCheckedInstances(newChecked);
    };

    const handleOnClose = () => {
        setCheckedInstances([]);
        onClose();
    }
    const handleOnSubmit = () => {
        const checkedMedia = mediaToOverWrite.filter(
            (file) => checkedInstances.includes(file.name));
        onSubmit(checkedMedia);
        setCheckedInstances([]);
    }

    const handleToggleAll = (checked: boolean) => {
        if (checked) {
            setCheckedInstances(mediaToOverWrite.map(file => file.name));
        } else {
            setCheckedInstances([]);
        }
    };
    return (
        <Dialog
            open={mediaToOverWrite.length > 0}
            onClose={onClose}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    handleOnSubmit();
                } else if (e.key === 'Escape') {
                    handleOnClose();
                }
            }}
            PaperProps={{
                sx: { width: '80%', maxWidth: '600px' }
            }}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Typography gutterBottom>
                    Skriv över följande filer:
                </Typography>
                {mediaToOverWrite && (
                    <Box component='div' sx={{ '& > .MuiList-root': { mt: -2 } }}>
                        <Checkbox
                            checked={checkedInstances.length === mediaToOverWrite.length}
                            onChange={(e) => handleToggleAll(e.target.checked)}
                            indeterminate={checkedInstances.length > 0 && checkedInstances.length < mediaToOverWrite.length}
                        />
                        Välj alla
                        <List sx={{ maxHeight: '200px', overflow: 'auto' }}>
                            {mediaToOverWrite.map((file) => (
                                <ListItem sx={{ mb: -3 }} key={file.name}>
                                    <Checkbox
                                        checked={checkedInstances.includes(file.name)}
                                        onChange={() => handleToggle(file.name)}
                                    />
                                    {file.name}
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleOnClose}>Avbryt</Button>
                <Button onClick={handleOnSubmit} disabled={checkedInstances.length == 0}>Bekräfta</Button>
            </DialogActions>
        </Dialog>
    );
}