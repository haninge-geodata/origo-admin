import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, List, ListItem, Box, Checkbox } from "@mui/material";
import React, { useState } from "react";
import { RelationService as service } from '@/api';
import LinkResourcePicker from "../AutoComplete/LinkResourcePicker";
import { LinkResourceDto, RelationDto } from "@/shared/interfaces/dtos";
import { useQuery } from "@tanstack/react-query";

interface LinkResourceDialogProps {
    linkResourceType: string;
    linkResource: LinkResourceDto;
    layerId: string;
    open: boolean;
    onClose: () => void;
    onSubmit: (linkResource: LinkResourceDto, mapInstanceIds: string[]) => void;
}

export default function LinkResourceDialog({ open, onClose, onSubmit, linkResource, linkResourceType, layerId }: LinkResourceDialogProps) {
    const { data, isLoading, error } = useQuery({ queryKey: ['relations'], queryFn: () => service.fetchRelations(layerId, 'MapInstance', 'instance.layers.id') });
    const [selectedLinkResource, setSelectedLinkResource] = useState<LinkResourceDto>(linkResource);
    const [mapInstances, setMapInstances] = useState<RelationDto[]>([]);
    const [checkedInstances, setCheckedInstances] = useState<string[]>([]);
    const disableSubmit = !selectedLinkResource || selectedLinkResource.id === linkResource.id;
    const [key, setKey] = useState(0);
    const handleChange = (value: LinkResourceDto) => {
        setSelectedLinkResource(value);
    };

    React.useEffect(() => {
        if (!isLoading && data) {
            setMapInstances(data);
        }
    }, [data, isLoading]);


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
    const handleOnClose = () => {
        setMapInstances([]);
        setCheckedInstances([]);
        setKey(key + 1);
        onClose();
    }
    const handleOnSubmit = () => {
        onSubmit(selectedLinkResource, checkedInstances);
        handleOnClose();
    }


    const handleToggleAll = (checked: boolean) => {
        if (checked) {
            setCheckedInstances(mapInstances.map(instance => instance.id));
        } else {
            setCheckedInstances([]);
        }
    };
    return (
        <Dialog
            open={open}
            onClose={onClose}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !disableSubmit) {
                    handleOnSubmit();
                } else if (e.key === 'Escape') {
                    handleOnClose();
                }
            }}
            PaperProps={{
                component: 'form',
                onSubmit: onSubmit,
                sx: { width: '80%', maxWidth: '600px' }
            }}
        >
            <DialogTitle>Byt källa för kartlager</DialogTitle>
            <DialogContent>
                <Typography variant="subtitle1" gutterBottom>Nuvarande källa</Typography>
                <Typography variant="body1">{linkResource.title}</Typography>
                <Typography variant="body1">{linkResource.name}</Typography>
                <Typography variant="body1">{linkResource.url}</Typography>
                <br />
                <Typography variant="subtitle1" gutterBottom>Ny källa</Typography>
                <LinkResourcePicker key={key} linkResourceType={linkResourceType} linkResource={selectedLinkResource} helperText={null} onChange={handleChange} ></LinkResourcePicker>
                {selectedLinkResource &&
                    <Box component='div'>
                        <Typography variant="body1">{selectedLinkResource.title}</Typography>
                        <Typography variant="body1">{selectedLinkResource.name}</Typography>
                        <Typography variant="body1">{selectedLinkResource.url}</Typography>
                    </Box>
                }
                <br />
                <Typography variant="subtitle1" gutterBottom>Lagret används i följande kartinstanser:</Typography>
                <Typography gutterBottom>Välj om uppdateringen även ska inkludera kartinstanser.</Typography>
                <Typography gutterBottom>
                    Observera att publicerade kartinstanser måste publiceras på nytt för att externa ändringar ska träda i kraft.</Typography>
                {mapInstances &&
                    <Box component='div' sx={{ '& > .MuiList-root': { mt: -2 } }}>
                        <Checkbox
                            checked={checkedInstances.length === mapInstances.length}
                            onChange={(e) => handleToggleAll(e.target.checked)}
                            indeterminate={checkedInstances.length > 0 && checkedInstances.length < mapInstances.length}
                        />
                        Välj alla
                        <List>
                            {mapInstances.map((instance) => (
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
                }
            </DialogContent>
            <DialogActions>
                <Button onClick={handleOnClose}>Avbryt</Button>
                <Button onClick={handleOnSubmit} disabled={disableSubmit} >Byt källa</Button>
            </DialogActions>
        </Dialog>
    );
}