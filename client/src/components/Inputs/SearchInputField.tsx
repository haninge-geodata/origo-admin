import React from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';

interface SearchInputFieldProps {
    id: string;
    name: string;
    placeholder: string;
    fullWidth: boolean;
    onClick: () => void;
}

const SearchInputField: React.FC<SearchInputFieldProps> = ({ id, name, placeholder, fullWidth, onClick }) => {
    return (
        <TextField
            variant="outlined"
            fullWidth
            id={id}
            name={name}
            placeholder={placeholder}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton onClick={onClick}>
                            <SearchIcon />
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    );
};

export default SearchInputField;
