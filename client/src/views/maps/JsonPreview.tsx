import React, { useEffect, useState } from 'react';
import { MapInstanceService as service } from '@/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, IconButton } from '@mui/material';
import JSONEditor from '@/components/Editors/JSONEditor';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useApp } from '@/contexts/AppContext';

interface JsonPreviewProps {
    id: string;
    updateKey: number;
}

const JsonPreview = ({ id, updateKey }: JsonPreviewProps) => {
    const [refreshKey, setRefreshKey] = useState(0);
    const queryKey = ["preview", id];
    const queryClient = useQueryClient();
    const { showToast } = useApp();

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: queryKey,
        queryFn: () => service.fetchPreview(id)
    });

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: queryKey });
        setRefreshKey(prev => prev + 1);
    }, [updateKey, id]);

    const onChange = () => {
        showToast('Ändringar direkt i JSON:en kommer inte sparas.', 'info');
        console.info(`[${new Date().toISOString()}] Pointless to change, it will not be saved anyway :)`)
    }

    const handleRefresh = async () => {
        await queryClient.invalidateQueries({ queryKey: queryKey });
        await refetch();
        setRefreshKey(prev => prev + 1);
        showToast('JSON:en har uppdaterats', 'info');
    }

    return (
        <Box component='div' sx={{ p: '20px', overflow: 'scroll' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <IconButton onClick={handleRefresh} color="primary" aria-label="refresh">
                    <RefreshIcon />
                </IconButton>
            </Box>
            {data && (
                <JSONEditor
                    key={`${updateKey}-${refreshKey}`}
                    value={data}
                    onChange={() => onChange()}
                />
            )}
        </Box>
    );
};

export default JsonPreview;