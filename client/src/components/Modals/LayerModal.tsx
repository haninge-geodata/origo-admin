import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import DetailedDataTable from '../Tables/DetailedDataTable';
import { DataRow, TableData } from '@/interfaces';
import { Stack } from '@mui/material';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    height: '80%',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
};

const contentStyle = {
    flex: 1,
    overflowY: 'auto',
};

interface LayerModalProps {
    open: boolean;
    handleClose: () => void;
    selectedRows: DataRow[];
    onRowSelectionChanged: (ids: string[]) => void;
    tableData: TableData;
}

export default function LayerModal({ open, handleClose, selectedRows, onRowSelectionChanged, tableData }: LayerModalProps) {
    return (
        <div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box component='div' sx={style}>
                    <Box component='div' sx={contentStyle}>
                        {tableData && (
                            <DetailedDataTable
                                selectedRows={selectedRows}
                                onSelectionChanged={onRowSelectionChanged}
                                pagination={true}
                                rowsPerPage={10}
                                data={tableData}
                                isSearchable={true}
                            />
                        )}
                    </Box>
                    <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ marginTop: 2 }}>
                        <Button variant="outlined" sx={{ borderColor: 'white' }} onClick={handleClose}>
                            Stäng
                        </Button>
                    </Stack>
                </Box>
            </Modal>
        </div>
    );
}
