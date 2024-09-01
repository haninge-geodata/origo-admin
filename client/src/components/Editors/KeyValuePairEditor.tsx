import React, { useState, useCallback } from 'react';
import { Box, TextField, Button, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Paper } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { KeyValuePair } from '@/shared/interfaces/dtos';

interface KeyValuePairEditorProps {
    value: KeyValuePair[];
    onChange: (newValue: KeyValuePair[]) => void;
    onBlur?: () => void;
}

const KeyValuePairEditor: React.FC<KeyValuePairEditorProps> = ({ value, onChange, onBlur }) => {
    const [internalPairs, setInternalPairs] = useState<KeyValuePair[]>(value);
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const validateKey = useCallback((key: string, currentIndex: number | null): boolean => {
        const isDuplicate = internalPairs.some((pair, index) =>
            pair.key === key && index !== currentIndex
        );
        if (isDuplicate) {
            setError(`Id "${key}" existerar redan. Vänligen välj en unik nyckel.`);
            return false;
        }
        setError(null);
        return true;
    }, [internalPairs]);

    const addPair = useCallback(() => {
        if (newKey && newValue) {
            if (validateKey(newKey, null)) {
                const newPairs = [...internalPairs, { key: newKey, value: newValue }];
                setInternalPairs(newPairs);
                setNewKey('');
                setNewValue('');
                onChange(newPairs);
            }
        }
    }, [newKey, newValue, internalPairs, onChange, validateKey]);

    const removePair = useCallback((index: number) => {
        const newPairs = internalPairs.filter((_, i) => i !== index);
        setInternalPairs(newPairs);
        onChange(newPairs);
    }, [internalPairs, onChange]);

    const startEdit = useCallback((index: number) => {
        setEditIndex(index);
        setNewKey(internalPairs[index].key);
        setNewValue(internalPairs[index].value);
    }, [internalPairs]);

    const saveEdit = useCallback(() => {
        if (editIndex !== null && newKey && newValue) {
            if (validateKey(newKey, editIndex)) {
                const newPairs = internalPairs.map((pair, index) =>
                    index === editIndex ? { key: newKey, value: newValue } : pair
                );
                setInternalPairs(newPairs);
                setEditIndex(null);
                setNewKey('');
                setNewValue('');
                onChange(newPairs);
            }
        }
    }, [editIndex, newKey, newValue, internalPairs, onChange, validateKey]);

    return (
        <Paper
            elevation={0}
            variant="outlined"
            sx={{
                p: 2,
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                backgroundColor: '#FFFFFF'
            }}
        >
            <Box onBlur={onBlur}>
                <Box display="flex" alignItems="flex-start" mt={2}>
                    <TextField
                        label="Id"
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                        error={!!error}
                        helperText={error}
                        margin="normal"
                        size="small"
                        sx={{ mr: 1, flex: 1 }}
                    />
                    <TextField
                        label="Värde"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        margin="normal"
                        size="small"
                        multiline={true}
                        sx={{ mr: 1, flex: 1 }}
                    />
                    <Button
                        startIcon={<AddIcon />}
                        onClick={editIndex !== null ? saveEdit : addPair}
                        variant="contained"
                        sx={{ mt: 2, height: 40 }}
                    >
                        {editIndex !== null ? 'Uppdatera' : 'Lägg till'}
                    </Button>
                </Box>
                <List sx={{ overflowY: 'scroll', mb: 2 }}>
                    {internalPairs.map((pair, index) => (
                        <ListItem key={index} sx={{ py: 1, px: 2, '&:hover': { backgroundColor: '#f0f0f0' } }}>
                            <ListItemText
                                primary={pair.key}
                                secondary={pair.value}
                                primaryTypographyProps={{ fontWeight: 'bold' }}
                            />
                            <ListItemSecondaryAction>
                                <IconButton size="small" edge="end" aria-label="edit" onClick={() => startEdit(index)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton size="small" edge="end" aria-label="delete" onClick={() => removePair(index)}>
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Paper>
    );
};

export default React.memo(KeyValuePairEditor);