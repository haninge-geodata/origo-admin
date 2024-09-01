import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { StyleService as service } from "@/api";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { StyleSchemaDto } from '@/shared/interfaces/dtos';
import FormDialog from '../Dialogs/FormDialog';
import { Box, IconButton } from '@mui/material';
import AddBoxIcon from '@mui/icons-material/AddBox';

const filter = createFilterOptions<StyleSchemaDto>();

interface StylePickerProps {
    value: any;
    error?: boolean;
    helperText: string | null;
    fullWidth?: boolean;
    disabled?: boolean;
    onChange: (value: any) => void;
    onBlur?: () => void;
}

export default function StylePicker({ value, error, fullWidth = true, disabled = false, onChange, helperText, onBlur }: StylePickerProps) {
    const queryKey = "styleSchemas";
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({ queryKey: [queryKey], queryFn: () => service.fetchAll() });
    const initialOption = { name: 'Välj stilschema för lagret', id: 'default' };
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && data) {
            const actualOptions = data;
            const foundValue = actualOptions.find(option => option.id === value.id);
            if (foundValue) {
                setSelectedValue(foundValue);
            } else {
                setSelectedValue(initialOption);
            }
        }
    }, [value, data, isLoading]);
    const handleDialogClose = (newValue?: string) => {
        if (newValue) {
            const foundValue = data!.find(d => d.name === newValue);
        }
        setDialogOpen(false);
        setErrorMessage(null);

    };
    const handleAutoCompleteChange = (event: React.ChangeEvent<{}>, newValue: StyleSchemaDto | null) => {
        if (newValue?.id === 'adding-new') {
            setDialogOpen(true);
        }
        else if (newValue && newValue.id !== 'default') {
            setSelectedValue(newValue);
            onChange(newValue);
        }
        else if (newValue && 'id' in newValue) {
            onChange(newValue);
        }
    }
    const onSubmit = async (formData: FormData) => {
        const entries = Object.fromEntries(formData.entries());

        if (data?.length === 0 || !data?.some((styleSchema: StyleSchemaDto) => styleSchema.name.toLowerCase() === entries.name.toString().toLowerCase())) {
            const newStyleSchema: StyleSchemaDto = {
                name: entries.name.toString(),
                styles: []
            };

            await service.add(newStyleSchema).then((dto) => {
                queryClient.invalidateQueries({ queryKey: [queryKey] });
                if (dto.id!) {
                    setSelectedValue(dto);
                    handleDialogClose();
                }
            }).catch((error) => {
                const message = error.message || "Ett okänt fel inträffade.";
                setErrorMessage(message);
            });
        }
        else {
            setErrorMessage("Stilschema med samma namn finns redan.");
        }
    }
    const onDialogInputChange = () => {
        if (setErrorMessage) setErrorMessage(null);
    }

    return (
        data && (<>
            <Box component='div' sx={{ display: 'flex', alignItems: 'center', mt: '16px', mb: '8px', width: fullWidth ? '100%' : 'auto' }}>
                <Autocomplete
                    sx={{ width: fullWidth ? '100%' : 'auto', mt: '16px', mb: '8px' }}
                    value={selectedValue}
                    id="style-picker"
                    filterOptions={(options, params) => {
                        const filtered = filter(options, params);
                        const { inputValue } = params;
                        const isExisting = options.some(option => inputValue === option.name);
                        if (inputValue !== '' && !isExisting) {
                            filtered.push({
                                id: 'adding-new',
                                name: `Saknas stilschemat? Klicka här för att lägga till nytt`,
                                styles: [],
                            });
                        }
                        return filtered;
                    }}
                    onChange={handleAutoCompleteChange}
                    isOptionEqualToValue={(option, value) => {
                        if (option?.name === value?.name) {
                            return true;
                        }
                        if (value.id === 'adding-new') {
                            return true;
                        }
                        if (value.id === 'default') {
                            return true;
                        }
                        if (data?.length > 1) {
                            return true;
                        }
                        return false;
                    }}
                    options={data?.map((option) => option) || []}
                    getOptionDisabled={(option) => option.id === 'default'}
                    getOptionLabel={(option) => {
                        return option?.name || 'Okänt stilschema';
                    }
                    }
                    renderInput={(params) => <TextField {...params} error={error} helperText={helperText} onBlur={onBlur} />}
                />
                <IconButton onClick={() => setDialogOpen(true)} sx={{ ml: 1, color: 'action.active' }}>
                    <AddBoxIcon />
                </IconButton>
            </Box>
            <FormDialog open={isDialogOpen} onClose={handleDialogClose} title="Skapa nytt Stilschema"
                contentText="Skapa nytt stilschema genom att fylla i namn nedan och trycka Skapa."
                onSubmit={onSubmit}
                fieldToValidate='name'
                errorMessage={errorMessage}
                textField={<TextField
                    autoFocus
                    onChange={onDialogInputChange}
                    required
                    margin="dense"
                    id="name"
                    name="name"
                    label="Namn på stilschema"
                    type="text"
                    fullWidth
                    variant="standard"
                />} />
        </>)
    );
}