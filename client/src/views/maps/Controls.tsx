import TransferList, { TransferListItem } from '@/components/DnDList/TransferList';
import React, { useEffect, useState } from 'react';
import { MapControlService as service } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { MapControlDto } from '@/shared/interfaces/dtos';
import { Box } from '@mui/material';

interface ControlsProps {
    selectedControls: MapControlDto[];
    onSave: (choosenControls: MapControlDto[]) => void;
}

const Controls = ({ selectedControls, onSave }: ControlsProps) => {
    const { data } = useQuery({ queryKey: ['mapControls'], queryFn: () => service.fetchAll() });
    const [allTransferListItems, setAllTransferListItems] = useState<TransferListItem[]>();
    const [selectedTransferListItems, setSelectedTransferListItems] = useState<TransferListItem[]>();
    const [key, setKey] = useState(0);
    const [availableControls, setAvailableControls] = useState<MapControlDto[]>();

    useEffect(() => {
        if (data) {
            setControlsState(data);
        }
    }, [data]);

    const setControlsState = (data: MapControlDto[]) => {
        const toTransferListItems = (data: MapControlDto[]) => {
            return data?.map((control: any) => {
                return {
                    id: control.id,
                    content: control.title,
                    icon: control.icon,
                    data: control
                };
            });
        };
        setAvailableControls(data);
        const allItems: TransferListItem[] = toTransferListItems(data);
        const selectedItems: TransferListItem[] = toTransferListItems(selectedControls);
        setAllTransferListItems(allItems);
        setSelectedTransferListItems(selectedItems);
    }

    const handleOnSave = (choosenControls: TransferListItem[]) => {
        const choosenControlIds = choosenControls.map(control => control.id);
        let selectedControls = availableControls!.filter(control => choosenControlIds.includes(control.id!));
        selectedControls = choosenControlIds.map(id => selectedControls.find(control => control.id === id)!);
        onSave(selectedControls);
        setSelectedTransferListItems(choosenControls);
        setKey(key + 1);
    }

    return (
        <Box component='div' sx={{ p: '20px' }}>
            {allTransferListItems && selectedTransferListItems && (
                <TransferList key={key} items={allTransferListItems} selectedItems={selectedTransferListItems} handleOnSave={handleOnSave}></TransferList>
            )}
        </Box>
    );
};

export default Controls;