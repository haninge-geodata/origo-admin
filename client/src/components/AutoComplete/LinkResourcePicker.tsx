import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { LinkResourceService as service } from "@/api";
import { useQuery } from '@tanstack/react-query';
import { LinkResourceDto } from '@/shared/interfaces/dtos';
const filter = createFilterOptions<LinkResourceDto>();

interface LinkResourcePickerProps {
    linkResourceType: string;
    linkResource: LinkResourceDto;
    error?: boolean;
    helperText: string | null;
    fullWidth?: boolean;
    disabled?: boolean;
    onChange: (value: LinkResourceDto) => void;
    onBlur?: () => void;
}

export default function LinkResourcePicker({ linkResourceType, linkResource, error, fullWidth = true, disabled = false, onChange, helperText, onBlur }: LinkResourcePickerProps) {
    const queryKey = "linkResources";
    const { data, isLoading } = useQuery({ queryKey: [queryKey], queryFn: () => service.fetchByType(linkResourceType) });
    const [selectedValue, setSelectedValue] = useState(linkResource.id);

    useEffect(() => {
        if (!isLoading && data) {
            const actualOptions = data;
            const foundValue = actualOptions.find(option => option.id === linkResource.id);
            if (foundValue) {
                setSelectedValue(linkResource.id);
            }
        }
    }, [linkResource.id, data, isLoading]);

    const handleAutoCompleteChange = (event: React.ChangeEvent<{}>, newValue: LinkResourceDto | null) => {

        if (newValue && newValue.id !== 'default') {
            setSelectedValue(linkResource.id);
            onChange(newValue);
        }
        else if (newValue && 'id' in newValue) {
            onChange(newValue);
        }
    }
    return (
        data && (<>
            <Autocomplete
                sx={{ width: fullWidth ? '100%' : 'auto', mt: '16px', mb: '8px' }}
                value={linkResource.id ? data.find(option => option.id === linkResource.id) : null}
                id="style-picker"
                filterOptions={(options, params) => {
                    const filtered = filter(options, params);
                    return filtered;
                }}
                onChange={handleAutoCompleteChange}
                isOptionEqualToValue={(option, value) => {
                    if (option?.name === value?.name) {
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
                    return option.name;
                }
                }
                renderInput={(params) => <TextField {...params} error={error} helperText={helperText} onBlur={onBlur} />}
            />
        </>)
    );
}