import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, List, ListItem, Box, Checkbox } from "@mui/material";
import React, { useState } from "react";
import { RelationDto } from "@/shared/interfaces/dtos";

interface SyncLayerDialogProps {
    title: string;
    relations: RelationDto[];
    open: boolean;
    onClose: () => void;
    onSubmit: (mapInstanceIds: string[], actions: string[]) => void;
}

interface CheckboxState {
    [key: string]: boolean;
}

export default function SyncLayerDialogDialog({ open, onClose, onSubmit, title, relations }: SyncLayerDialogProps) {
    const [checkedInstances, setCheckedInstances] = useState<string[]>([]);
    const [checkboxes, setCheckboxes] = useState<CheckboxState>({});

    const [key, setKey] = useState(0);

    const handleToggle = (id: string) => {
        const currentIndex = checkedInstances.indexOf(id);
        const newChecked = [...checkedInstances];

        if (currentIndex === -1) {
            newChecked.push(id);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setCheckedInstances(newChecked);
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setCheckboxes(prevState => ({
            ...prevState,
            [name]: checked
        }));
    };
    const handleOnClose = () => {
        setKey(key + 1);
        onClose();
    }
    const handleOnSubmit = () => {
        const actions = Object.keys(checkboxes).filter(key => checkboxes[key]);
        onSubmit(checkedInstances, actions);
    }

    const handleToggleAll = (checked: boolean) => {
        if (checked) {
            setCheckedInstances(relations.map(instance => instance.id));
        } else {
            setCheckedInstances([]);
        }
    };
    return (
        <Dialog
            open={open}
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
                <Typography variant="subtitle1" gutterBottom>
                    Lagret används i följande kartinstanser:
                </Typography>
                <Typography gutterBottom>
                    Välj om uppdateringen även ska inkludera kartinstanser.
                </Typography>
                <Typography gutterBottom>
                    (Observera att publicerade kartinstanser måste publiceras på nytt för att externa ändringar ska träda i kraft.)
                </Typography>
                <Typography gutterBottom>
                    Om uppdateringen inte ska påverka kartinstanserna klicka bara på bekräfta.
                </Typography>
                {relations && (
                    <Box component='div' sx={{ '& > .MuiList-root': { mt: -2 } }}>
                        <Checkbox
                            checked={checkedInstances.length === relations.length}
                            onChange={(e) => handleToggleAll(e.target.checked)}
                            indeterminate={checkedInstances.length > 0 && checkedInstances.length < relations.length}
                        />
                        Välj alla
                        <List sx={{ maxHeight: '200px', overflow: 'auto' }}>
                            {relations.map((instance) => (
                                <ListItem sx={{ mb: -3 }} key={instance.id}>
                                    <Checkbox
                                        checked={checkedInstances.includes(instance.id)}
                                        onChange={() => handleToggle(instance.id)}
                                    />
                                    {instance.name}
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Välj vad som ska uppdateras för eventuella kartinstanser:
                </Typography>
                <Box component='div' sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box component='div' sx={{ display: 'flex', alignItems: 'center' }}>
                        <Checkbox
                            onChange={(e) => handleCheckboxChange('style', e.target.checked)}
                            checked={checkboxes['style'] || false}
                        />
                        <Typography>Uppdatera stilsättning</Typography>
                    </Box>
                    <Box component='div' sx={{ display: 'flex', alignItems: 'center' }}>
                        <Checkbox
                            onChange={(e) => handleCheckboxChange('details', e.target.checked)}
                            checked={checkboxes['details'] || false}
                        />
                        <Typography>Uppdatera övriga detaljer</Typography>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleOnClose}>Avbryt</Button>
                <Button onClick={handleOnSubmit}>Bekräfta</Button>
            </DialogActions>
        </Dialog>
    );
}