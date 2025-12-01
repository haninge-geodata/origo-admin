import { MediaDto } from "@/shared/interfaces/dtos";
import { Box, Button, Grid, InputAdornment, TextField, Typography, styled } from "@mui/material";
import { useEffect, useState } from "react";
import { Folder as FolderIcon,
    CloudUpload as CloudUploadIcon,
    CreateNewFolder as CreateNewFolderIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { MediaService as service } from '@/api';
import DeleteIcon from '@mui/icons-material/Delete';
import { useApp } from "@/contexts/AppContext";
import AlertDialog from "../Dialogs/AlertDialog";
import FormDialog from "@/components/Dialogs/FormDialog";

interface MediaSelectorProps {
    showSelectedMediaInfo?: boolean;
    onMediaSelect?: (fileInfo: { file: string, fileIncPath: string }) => void;
    mediaToSelect?: string
    maxHeight?: number;
    minHeight?: number;
}

export const MediaSelector = ({ onMediaSelect, maxHeight = 800, minHeight = 350, showSelectedMediaInfo, mediaToSelect }: MediaSelectorProps) => {
    const queryKey = "media";
    const { data } = useQuery({ queryKey: [queryKey], queryFn: () => service.fetchAll() });
    const [selectedMedia, setselectedMedia] = useState(null as unknown as MediaDto);
    const [mediaData, setmediaData] = useState<MediaDto[]>([]);
    const [filterText, setFilterText] = useState('');
    const [filteredData, setFilteredData] = useState<MediaDto[]>([]);
    const [isAlertDialogOpen, setAlertDialogOpen] = useState(false);
    const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
    const queryClient = useQueryClient();
    const { showToast } = useApp();
    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    useEffect(() => {
        if (data) {
            setmediaData(data);
            if (mediaToSelect) {
                let filename = extractFilename(mediaToSelect!);
                let selectedItem = data.find((x) => x.name === filename);
                setselectedMedia(selectedItem!);
            }

        }
    }, [data]);

    useEffect(() => {
        if (!data) return;
        const lowercasedFilter = filterText.toLowerCase();
        const filtered = data.filter(item => item.name.toLowerCase().includes(lowercasedFilter));
        setFilteredData(filtered);
    }, [data, filterText]);

    const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterText(event.target.value);
    };

    function extractFilename(url: string): string {
        const regex = /[^\/\\&\?]+\.\w{3,4}(?=([\?&].*$|$))/;
        const match = url.match(regex);
        return match ? match[0] : '';
    }

    const toggleCreateFolderDialog = async () => {
        if (isFolderDialogOpen) {
            setIsFolderDialogOpen(false);
        } else {
            setIsFolderDialogOpen(true);
        }
    };

    const handleSubmitFolder = async (formData: FormData) => {
        const folderName = formData.get('name');
        console.log(`[${new Date().toISOString()}] Creating folder: ${folderName}`);
        try {
            await service.createFolder(folderName!.toString());
            queryClient.invalidateQueries({ queryKey: [queryKey] });
            showToast('Mappen har skapats', 'success');
            toggleCreateFolderDialog();
        } catch (error) {
            showToast('Kunde inte skapa mapp.', 'error');
            console.error(`[${new Date().toISOString()}] Error creating folder: ${error}`);
        }
    }

    const handleUpload = async (event: any) => {
        const files = event.target.files;
        if (files.length > 0) {
            try {
                await service.upload(Array.from(files));
                queryClient.invalidateQueries({ queryKey: [queryKey] });
                showToast('Ikonen har laddats upp', 'success');

            } catch (error) {
                showToast('Ikonen kunde inte laddas upp', 'error');
                console.error(`[${new Date().toISOString()}] Fel vid uppladdning av filer: ${error}`);
            }
        }
    };

    const handleDeleteMedia = async () => {
        setAlertDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedMedia) {
            try {
                if(selectedMedia.fieldname === 'folders') {
                    await service.deleteFolder(selectedMedia.id!);
                    showToast('Mappen har raderats', 'success');
                } else {
                    await service.deleteFile(selectedMedia.id!);
                    showToast('Ikonen har raderats', 'success');
                }
                queryClient.invalidateQueries({ queryKey: [queryKey] });
                setselectedMedia(null as unknown as MediaDto);
                setAlertDialogOpen(false);
            } catch (error) {
                showToast('Kunde inte radera ikonen.', 'error');
                console.error(`[${new Date().toISOString()}] Error deleting the icon: ${error}`);
                setAlertDialogOpen(false);
            }
        }
    };

    const handleMediaClick = (item: MediaDto) => {
        let selectedItem = mediaData.find((x) => x.id === item.id);

        if (selectedMedia && selectedMedia.id === item.id) {
            setselectedMedia(null as unknown as MediaDto);
            if (onMediaSelect) {
                onMediaSelect({ file: '', fileIncPath: '' });
            }
            return;
        }

        setselectedMedia(selectedItem!);
        if (onMediaSelect) {
            onMediaSelect({ file: selectedItem!.filename, fileIncPath: selectedItem!.path });
        }
    };

    const formatName = (name: string, cropAt: number) => {
        let formattedName = name;
        const dotIndex = name.lastIndexOf('.');
        if (dotIndex > 0) {
            formattedName = name.substring(0, dotIndex);
        }
        formattedName = formattedName.replace(/_/g, ' ');
        formattedName = formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
        if (formattedName.length > cropAt) {
            formattedName = formattedName.substring(0, cropAt) + '...';
        }
        return formattedName;
    }

    return (
        <Grid item xs={12} sx={{ border: '1px solid #E0E0E0' }}>
            <Box component="div" sx={{ borderBottom: '1px solid #E0E0E0', backgroundColor: '#fbfafa', height: '56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ ml: '10px', textTransform: 'uppercase' }} >Ikoner</Typography>
                <Box component="div" >
                    <Button
                        sx={{
                            height: '40px',
                            bgcolor: 'transparent',
                            color: '#1677ff',
                            '& .MuiSvgIcon-root': { fontSize: '2.1rem' },
                            '&:hover': {
                                bgcolor: 'transparent',
                                color: '#1677ff',
                            }
                        }}
                        component="label"
                        role={undefined}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<CreateNewFolderIcon />}
                        onClick={toggleCreateFolderDialog}
                    />
                    <Button
                        sx={{
                            height: '40px',
                            bgcolor: 'transparent',
                            color: '#1677ff',
                            '& .MuiSvgIcon-root': { fontSize: '2.1rem' },
                            '&:hover': {
                                bgcolor: 'transparent',
                                color: '#1677ff',
                            }
                        }}
                        component="label"
                        role={undefined}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<CloudUploadIcon />}
                    >
                        <VisuallyHiddenInput multiple type="file" onChange={handleUpload} />
                    </Button>
                    <TextField
                        value={filterText}
                        onChange={handleFilterChange}
                        placeholder={`Sök ${data?.length} resultat...`}
                        sx={{ width: '220px', height: '40px', mr: '10px' }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            style: { height: '40px' }
                        }}
                        inputProps={{
                            style: { height: '40px', padding: '0 14px' }
                        }}
                    />
                </Box>
            </Box>
            <Grid item xs={12} md={12} lg={12} sx={{ display: 'flex', maxHeight: `${maxHeight}px`, minHeight: `${minHeight}px` }}>
                <Grid container rowSpacing={4.5} columnSpacing={0} sx={{ mt: '1px', overflowY: 'auto' }}>
                    {filteredData.map((item, index) => (
                        <Grid item key={index} xs={6} sm={4} md={3} lg={2} sx={{ textAlign: 'center' }}>
                            {
                                // Display images using <img> elements, otherwise use appropriate mui icons
                                item.mimetype.startsWith('image/') ?
                                    <img style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            cursor: 'pointer',
                                            border: selectedMedia && selectedMedia.id === item.id ? '2px solid #1890ff' : 'none',
                                            boxShadow: selectedMedia && selectedMedia.id === item.id ? '0 0 10px #1890ff, 0 0 6px #1890ff80' : 'none'
                                        }}
                                        src={`${item.path}?w=48px&h=48px&fit=crop&auto=format`}
                                        onClick={() => handleMediaClick(item)}
                                    /> :
                                item.fieldname === 'folders' ?
                                    <FolderIcon onClick={() => handleMediaClick(item)}
                                        style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '50%',
                                            cursor: 'pointer',
                                            color: 'rgba(0, 0, 0, 0.54)',
                                            border: selectedMedia && selectedMedia.id === item.id ? '2px solid #1890ff' : 'none',
                                            boxShadow: selectedMedia && selectedMedia.id === item.id ? '0 0 10px #1890ff, 0 0 6px #1890ff80' : 'none'
                                        }}
                                    /> : null
                            }
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                {formatName(item.name, 20)}
                            </Typography>
                        </Grid>
                    ))}
                </Grid>
                {showSelectedMediaInfo && (
                    <Grid item xs={12} md={4} lg={4} sx={{ display: 'flex' }}>
                        <Box component="div" sx={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '10px', borderLeft: '1px solid #E0E0E0' }}>
                            {selectedMedia ? (
                                <>
                                    <Box component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="h6">{formatName(selectedMedia.name, 45)}</Typography>
                                        <Box component="div" onClick={() => handleDeleteMedia()}
                                            sx={{ opacity: 0.7, '&:hover': { opacity: 1, transform: 'scale(1.1)', cursor: 'pointer' } }}>
                                            <DeleteIcon />
                                        </Box>
                                    </Box>
                                    <Box component="div">
                                        <Typography variant="h6" sx={{ mt: 1 }}>Filtyp: {selectedMedia.fieldname === 'folders' ? 'mapp' : selectedMedia.mimetype}</Typography>
                                    </Box>
                                </>
                            ) : <Typography sx={{ p: 2 }}>Välj en ikon för att visa information.</Typography>}
                        </Box>
                    </Grid>
                )}
                <FormDialog open={isFolderDialogOpen} onClose={toggleCreateFolderDialog} title="Skapa ny mapp"
                    contentText="Fyll i ett unikt namn för mappen och tryck Skapa mapp. Undvik gärna specialtecken och blanksteg i mappnamnet eftersom det ingår i sökvägen till uppladdade filer."
                    onSubmit={handleSubmitFolder}
                    fieldToValidate="name"
                    textField={<TextField
                        autoFocus
                        required
                        margin="dense"
                        id="name"
                        name="name"
                        label="Namn på mappen"
                        type="text"
                        fullWidth
                        variant="standard"
                    />}
                />
                <AlertDialog open={isAlertDialogOpen} onConfirm={confirmDelete} contentText="Vänligen bekräfta borttagning av ikonen!"
                    onClose={() => setAlertDialogOpen(false)} title="Bekräfta borttagning">
                </AlertDialog>
            </Grid>
        </Grid>

    );
}
