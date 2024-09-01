import * as React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Paper, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect } from 'react';

interface GenericTableProps {
    headers: string[];
    data: Array<Record<string, any>>;
    onRowDelete: (updatedData: Array<Record<string, any>>) => void;
}

function GenericTable({ headers, data, onRowDelete }: GenericTableProps) {
    const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [tableData, setTableData] = React.useState(data);

    const handleDelete = (index: number) => {
        const updatedData = tableData.filter((_, i) => i !== index);
        setTableData(updatedData);
        onRowDelete(updatedData);
    };

    useEffect(() => {
        setTableData(data);
    }, [data]);

    const sortedData = React.useMemo(() => {
        let sortableItems = [...data];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [data, sortConfig]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="sortable table">
                <TableHead>
                    <TableRow>
                        {headers.map((header) => (
                            <TableCell
                                key={header}
                                sortDirection={sortConfig && sortConfig.key === header ? sortConfig.direction : false}
                            >
                                <TableSortLabel
                                    active={sortConfig?.key === header}
                                    direction={sortConfig?.key === header ? sortConfig.direction : 'asc'}
                                    onClick={() => requestSort(header)}
                                >
                                    {header.charAt(0).toUpperCase() + header.slice(1)}
                                </TableSortLabel>
                            </TableCell>
                        ))}
                        <TableCell>Ta bort</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedData.map((item, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {headers.map((header, cellIndex) => (
                                <TableCell key={cellIndex}>
                                    {item[header]}
                                </TableCell>

                            ))}
                            <TableCell>
                                <IconButton onClick={() => handleDelete(rowIndex)}>
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default GenericTable;
