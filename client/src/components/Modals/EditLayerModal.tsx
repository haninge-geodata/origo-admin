import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Autocomplete, Stack, TextField } from '@mui/material';
import { LayerDto, StyleSchemaDto, WMSLayerDto, WMTSLayerDto } from '@/shared/interfaces/dtos';
import StylePicker from '../AutoComplete/StylePicker';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '40%',
    height: '30%',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

interface EditLayerModalProps {
    open: boolean;
    handleClose: () => void;
    layerToEdit: LayerDto;
    setEditedLayers: (layers: LayerDto[]) => void;
    editedLayers: LayerDto[];
    featureInfoClickLayers?: readonly string[];
}

function hasFeatureInfoLayer(layer: LayerDto): layer is WMSLayerDto | WMTSLayerDto {
    if (layer.type === 'WMS' || layer.type === 'WMTS') {
        return true;
    }
    return false;
}
export default function EditLayerModal({
    open,
    handleClose,
    layerToEdit,
    editedLayers,
    setEditedLayers,
    featureInfoClickLayers,
}: EditLayerModalProps) {
    const [localLayerToEdit, setLocalLayerToEdit] = React.useState<string | null>(hasFeatureInfoLayer(layerToEdit) ? layerToEdit.featureinfoLayer || null : null);

    const updateLayerStyle = (selectedStyle: StyleSchemaDto) => {
        if (layerToEdit.style?.id !== selectedStyle.id) {
            const updatedLayer = { ...layerToEdit, style: selectedStyle };
            const updatedLayers = updateEditedLayers(updatedLayer);
            setEditedLayers(updatedLayers);
        }
    };

    const handleFeatureInfoLayerChange = (event: any, selectedLayer: string | null) => {
        if (hasFeatureInfoLayer(layerToEdit)) {
            const updatedLayer = { ...layerToEdit, featureinfoLayer: selectedLayer || undefined };
            const updatedLayers = updateEditedLayers(updatedLayer);
            setEditedLayers(updatedLayers);
            setLocalLayerToEdit(selectedLayer);
        }
    };

    const handleFeatureInfoLayerInputChange = (event: any, inputValue: string) => {
        if (hasFeatureInfoLayer(layerToEdit) && inputValue === '') {
            const updatedLayer = { ...layerToEdit, featureinfoLayer: undefined };
            const updatedLayers = updateEditedLayers(updatedLayer);
            setEditedLayers(updatedLayers);
            setLocalLayerToEdit(null);
        }
    };

    const updateEditedLayers = (updatedLayer: LayerDto) => {
        const layerExists = editedLayers.some(layer => layer.id === updatedLayer.id);
        return layerExists
            ? editedLayers.map(layer => layer.id === updatedLayer.id ? updatedLayer : layer)
            : [...editedLayers, updatedLayer];
    };

    return (
        <div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box component='div' sx={style}>
                    {layerToEdit && (
                        <Box component='div'>
                            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                                Lager: {layerToEdit.name}
                            </Typography>
                            <br />
                            <Typography variant="subtitle2" component="div" sx={{ flexGrow: 1 }}>
                                Välj Stilschema
                            </Typography>
                            <StylePicker value={layerToEdit.style} onChange={updateLayerStyle} helperText="" />
                            {featureInfoClickLayers && hasFeatureInfoLayer(layerToEdit) && (
                                <>
                                    <Typography variant="subtitle2" component="div" sx={{ flexGrow: 1 }}>
                                        Välj Lager för infoklick
                                    </Typography>
                                    <Autocomplete
                                        disablePortal
                                        id="select-feature-info-autocomplete"
                                        sx={{ width: '100%', mt: '16px', mb: '8px' }}
                                        value={localLayerToEdit}
                                        onChange={handleFeatureInfoLayerChange}
                                        onInputChange={handleFeatureInfoLayerInputChange}
                                        renderInput={(params) => <TextField {...params} />}
                                        options={featureInfoClickLayers}
                                    />
                                </>
                            )}
                        </Box>
                    )}
                    <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ marginTop: 'auto', paddingTop: 2 }}>
                        <Button variant="outlined" sx={{ borderColor: 'white' }} onClick={handleClose}>
                            Stäng
                        </Button>
                    </Stack>
                </Box>
            </Modal>
        </div>
    );
}
