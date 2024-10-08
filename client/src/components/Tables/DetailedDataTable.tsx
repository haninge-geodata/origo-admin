"use client";
import * as React from 'react';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { Box, Button, Checkbox, Chip, Grid, Link, Menu, MenuItem, TextField } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Column, DataRow, TableData } from '@/interfaces';
import TablePagination from '@mui/material/TablePagination';

interface CustomEvent {
    label: string;
    action: () => void;
}

interface DetailedDataTableProps {
    data: TableData | undefined;
    selectedRows?: DataRow[] | undefined;
    isSearchable?: boolean;
    expandable?: boolean;
    onAdd?: () => void;
    customOnAddLabel?: string;
    onEdit?: (id: string) => void;
    customEvents?: Array<{ label: string; action: (id: string) => void }>;
    onDelete?: (id: string) => void;
    onSelectionChanged?: (ids: string[]) => void;
    pagination?: boolean;
    rowsPerPage?: number;
    sortingEnabled?: boolean;
}

export default function DetailedDataTable({ data, selectedRows, isSearchable = false, expandable = false, onAdd,
    customOnAddLabel, onEdit, onDelete, onSelectionChanged, customEvents, pagination = false,
    sortingEnabled = false,
    rowsPerPage = 10 }: DetailedDataTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [selected, setSelected] = useState<string[]>(selectedRows ? selectedRows.map(row => row.id) : []);
    const [sortState, setSortState] = useState<{ field: string, direction: 'asc' | 'desc' } | null>(null);
    const prevDataRef = useRef<TableData | undefined>();
    const [selectAll, setSelectAll] = useState(false);

    const filteredRows = useMemo(() => {
        if (!searchTerm) return data?.rows || [];
        return data?.rows.filter((row) =>
            Object.values(row).some(val =>
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
        ) || [];
    }, [data?.rows, searchTerm]);

    useEffect(() => {
        if (JSON.stringify(prevDataRef.current) !== JSON.stringify(data)) {
            setSelected(selectedRows ? selectedRows.map(row => row.id) : []);
            prevDataRef.current = data;
        }
    }, [data, selectedRows]);

    const handleSort = (field: string) => {
        if (!sortingEnabled) return;
        setSortState(prevState => {
            if (prevState?.field === field) {
                return { field, direction: prevState.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { field, direction: 'asc' };
        });
    };

    const sortedAndPaginatedRows = useMemo(() => {
        let sorted = filteredRows;
        if (sortingEnabled && sortState) {
            sorted = [...filteredRows].sort((a, b) => {
                const aValue = a[sortState.field];
                const bValue = b[sortState.field];
                if (aValue < bValue) return sortState.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortState.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return pagination
            ? sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : sorted;
    }, [filteredRows, sortState, sortingEnabled, pagination, page, rowsPerPage]);

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = data?.rows?.map((row) => row.id) ?? [];
            setSelected(newSelected);
            setSelectAll(true);
            onSelectionChanged?.(newSelected);
        } else {
            setSelected([]);
            setSelectAll(false);
            onSelectionChanged?.([]);
        }
    };

    const handleClick = (id: string) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected: string[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }

        setSelected(newSelected);
        setSelectAll(newSelected.length === (data?.rows?.length ?? 0));
        onSelectionChanged?.(newSelected);
    };

    const handleChangePage = (event: any, newPage: any) => {
        setPage(newPage);
    };

    const handleSearch = (event: any) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setPage(0);
    };

    const isFiltered = searchTerm !== '';

    return (
        <Grid>
            <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: '20px', height: '40px' }}>
                {isSearchable && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder={`Sök ${data?.rows.length} resultat...`}
                            style={{ width: '220px', height: '40px' }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                endAdornment: searchTerm && (
                                    <InputAdornment position="end">
                                        <IconButton onClick={clearSearch} size="small">
                                            <CancelIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                style: { height: '40px' }
                            }}
                            inputProps={{
                                style: { height: '40px', padding: '0 14px' }
                            }}
                        />
                        {isFiltered && (
                            <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
                                Visar {filteredRows.length} av {data?.rows.length} resultat
                            </Typography>
                        )}
                    </Box>
                )}
                {onAdd && (
                    <Button variant="contained" onClick={() => onAdd()} startIcon={<AddIcon />}>
                        {customOnAddLabel || 'Lägg till'}
                    </Button>
                )}
            </Grid>
            <div>
                <TableContainer component={Paper}>
                    <Table aria-label="collapsible table">
                        <TableHead>
                            <TableRow>
                                {onSelectionChanged && (
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            indeterminate={selected.length > 0 && selected.length < (data?.rows?.length ?? 0)}
                                            checked={selectAll || (data?.rows && data.rows.length > 0 && selected.length === data.rows.length)}
                                            onChange={handleSelectAllClick}
                                        />
                                    </TableCell>
                                )}
                                {data?.columns.filter(column => !column.hide).map((column: Column) => (
                                    <TableCell
                                        key={column.field}
                                        onClick={() => handleSort(column.field)}
                                        style={{ cursor: sortingEnabled ? 'pointer' : 'default' }}
                                    >
                                        {column.headerName}
                                        {sortingEnabled && sortState?.field === column.field && (
                                            sortState.direction === 'asc' ? ' ▲' : ' ▼'
                                        )}
                                    </TableCell>
                                ))}
                                {expandable && (
                                    <TableCell>Visa Mer</TableCell>
                                )}
                                {(onEdit || onDelete || customEvents) && (
                                    <TableCell align="right">Hantera</TableCell>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data?.rows?.length ?? 0 > 0 ? (
                                sortedAndPaginatedRows.map((row) => (
                                    <RowContent
                                        key={row.id}
                                        row={row}
                                        isSelected={selected.includes(row.id)}
                                        columns={data!.columns}
                                        expandable={expandable}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        onSelectionChanged={onSelectionChanged ? (() => handleClick(row.id)) : undefined}
                                        customEvents={customEvents}
                                        selectAll={selectAll}
                                    />
                                ))
                            ) : (
                                <RowContent
                                    row={{ id: "-1", title: "No data available"}}
                                    columns={[]}
                                    isSelected={false}
                                    expandable={false}
                                    selectAll={false}
                                />
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                {pagination && (
                    <TablePagination
                        rowsPerPageOptions={[rowsPerPage]}
                        component="div"
                        count={filteredRows.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                    />
                )}
            </div >
        </Grid>
    );
}


interface RowContentProps {
    row: DataRow;
    columns: Column[];
    isSelected: boolean;
    expandable: boolean;
    onEdit?: (id: string) => void;
    customEvents?: Array<{ label: string; action: (id: string) => void }>;
    onDelete?: (id: string) => void;
    onSelectionChanged?: (id: string) => void;
    selectAll: boolean;
}

function RowContent({ row, columns, isSelected, expandable, onEdit, onDelete, onSelectionChanged, customEvents, selectAll }: RowContentProps) {
    const [open, setOpen] = React.useState(false);

    const renderCellValue = (value: any) => {
        let renderedValue;
        if (typeof value === 'boolean') {
            return value ? <CheckCircleIcon sx={{ color: 'green' }} /> : <CancelIcon sx={{ color: 'red' }} />;
        }
        if (typeof value === 'object' && value !== null) {

            if (Array.isArray(value)) {
                return value.map((item, index) => {
                    if (typeof item === 'string') {
                        return (
                            <Chip key={index} label={item} variant="outlined" />
                        );
                    } else if (typeof item === 'object' && (item.hasOwnProperty('name') || item.hasOwnProperty('title'))) {
                        const label = item.name || item.title;
                        return (
                            <Chip key={index} label={label} variant="outlined" />
                        );
                    } else {
                        return JSON.stringify(value);
                    }
                });
            }
            else if (value.title) {
                return value.title;
            }
            else if (value.name) {
                return value.name;
            }
            else if (value.key && value.value) {
                return `${value.key}: ${value.value}`;
            }
            return JSON.stringify(value);
        }
        if (typeof value === 'string' && value.includes("http")) {
            return <Link href={value}>{value}</Link>
        } else {
            renderedValue = value;
        }

        if (Array.isArray(renderedValue) || React.isValidElement(renderedValue)) {
            return <div>{renderedValue}</div>;
        }

        return renderedValue;
    };
    return (
        <>

            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                {onSelectionChanged && (
                    <TableCell>
                        <Checkbox
                            checked={selectAll || isSelected}
                            onChange={() => onSelectionChanged(row.id)}
                        />
                    </TableCell>
                )
                }
                {columns.map((column) => (
                    !column.hide && (
                        <TableCell key={column.field}>
                            {renderCellValue(row[column.field])}
                        </TableCell>
                    )
                ))}
                {expandable && (
                    <TableCell>
                        <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => setOpen(!open)}
                        >
                            {open ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                    </TableCell>
                )}
                {(onEdit || onDelete || customEvents) && PopOverMenu && (
                    <TableCell align="right">
                        <PopOverMenu
                            onEdit={onEdit ? () => onEdit(row.id) : undefined}
                            customEvents={customEvents ? customEvents.map(event => ({
                                label: event.label,
                                action: () => event.action(row.id)
                            })) : undefined}
                            onDelete={onDelete ? () => onDelete(row.id) : undefined}
                        />
                    </TableCell>
                )}
            </TableRow>
            {expandable && (
                <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }} component='div'>
                                <Grid container spacing={2}>
                                    {columns.map((column, index) => (
                                        <React.Fragment key={column.field}>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    {column.headerName}
                                                </Typography>
                                                <Box sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                                    {renderCellValue(row[column.field])}
                                                </Box>
                                            </Grid>
                                            {(index + 1) % 2 === 0 && index !== columns.length - 1 && (
                                                <Grid item xs={12} />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </Grid>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}

interface PopOverMenuProps {
    onEdit?: (id: string) => void;
    customEvents?: CustomEvent[];
    onDelete?: (id: string) => void;
}

export const PopOverMenu = ({ onEdit, onDelete, customEvents }: PopOverMenuProps) => {
    const ITEM_HEIGHT = 48;

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleAction = (action: () => void) => {
        action();
        handleClose();
    };

    return (
        <div>
            <IconButton
                aria-label="more"
                id="long-button"
                aria-controls={open ? 'long-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup="true"
                onClick={handleClick}
            >
                <MoreVertIcon />
            </IconButton>
            <Menu
                id="long-menu"
                MenuListProps={{
                    'aria-labelledby': 'long-button',
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    style: {
                        maxHeight: ITEM_HEIGHT * 4.5,
                        width: '20ch',
                    },
                }}
            >
                {onEdit && (
                    <MenuItem key="edit" onClick={() => handleAction(() => onEdit("edit"))}>
                        Editera
                    </MenuItem>
                )}
                {customEvents && customEvents.map((event, index) => (
                    <MenuItem key={`custom-${index}`} onClick={() => handleAction(event.action)}>
                        {event.label}
                    </MenuItem>
                ))}
                {onDelete && (
                    <MenuItem key="delete" onClick={() => handleAction(() => onDelete("delete"))}>
                        Ta bort
                    </MenuItem>
                )}
            </Menu>
        </div>
    );
};