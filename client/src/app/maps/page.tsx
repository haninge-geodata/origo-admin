'use client';
import { Grid, Typography, Button, TextField } from "@mui/material";
import MainCard from "@/components/Cards/MainCard/MainCard";
import styles from "@/app/page.module.css";
import { useRouter, usePathname } from "next/navigation";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { MapInstanceService as service } from '@/api';
import { mapDataToTableFormat } from "@/utils/mappers/toDataTable";
import mapSpec from "@/assets/specifications/tables/mapInstanceTableSpecification.json";
import DetailedDataTable from "@/components/Tables/DetailedDataTable";
import FormDialog from "@/components/Dialogs/FormDialog";
import { useState } from "react";
import { MapInstanceDto } from "@/shared/interfaces/dtos";
import AlertDialog from "@/components/Dialogs/AlertDialog";
import { useApp } from "@/contexts/AppContext";

export default function Page() {
    const queryKey = 'maps';
    const queryClient = useQueryClient();
    const { data = [], isLoading, error } = useQuery({ queryKey: [queryKey], queryFn: () => service.fetchList() });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [toBeDeteledId, setToBeDeletedId] = useState<string | null>(null);
    const [isAlertDialogOpen, setAlertDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { showToast } = useApp();

    const router = useRouter();
    const pathname = usePathname()

    const handleDialogOpen = () => {
        setErrorMessage(null);
        setIsDialogOpen(true);
    };
    const handleDialogClose = () => {
        setIsDialogOpen(false);
    };

    const handleAddClick = () => {
        handleDialogOpen();
    };

    const handleEdit = (id: string) => {
        const editUrl = `${pathname}/edit/${id}`;
        router.push(editUrl);
    };
    const onChange = () => {
        if (setErrorMessage) setErrorMessage(null);
    }

    const confirmDelete = async () => {
        try {
            let id = toBeDeteledId!;
            await service.delete(id);
            queryClient.invalidateQueries({ queryKey: [queryKey] });
            setAlertDialogOpen(false);
            showToast('Kartinstansen raderades', 'success');

        } catch (error) {
            showToast('Ett fel inträffade, kunde inte radera kartinstansen.', 'error');
            console.error('Error deleting WMS Layer:', error);
        }
    }
    const handleDelete = async (id: string) => {
        setToBeDeletedId(id);
        setAlertDialogOpen(true);
    };

    const onSubmit = async (formData: FormData) => {
        const entries = Object.fromEntries(formData.entries());

        if (data?.length === 0 || !data?.some((d) => d.name.toLowerCase() === entries.name.toString().toLowerCase())) {
            const newMapInstance: MapInstanceDto = {
                name: entries.name.toString(),
                title: entries.name.toString(),
                instance: {
                    controls: [],
                    groups: [],
                    layers: []
                }
            };

            await service.add(newMapInstance).then((dto) => {
                queryClient.invalidateQueries({ queryKey: [queryKey] });
                if (dto.id!) {
                    handleDialogClose();
                    const editUrl = `${pathname}/edit/${dto.id!}`;
                    router.push(editUrl);
                }
            }).catch((error) => {
                const message = error.message || "Ett okänt fel inträffade.";
                setErrorMessage(message);
            });
        }
        else {
            setErrorMessage("En kartinstans med samma namn finns redan.");
        }
    }

    if (isLoading) {
        return <div>Laddar...</div>;
    }

    if (error) {
        return <div>Ett fel inträffade: {error.message}</div>;
    }

    return (
        <main className={styles.main}>
            <Grid container rowSpacing={4.5} columnSpacing={2.75}>
                <Grid item xs={12} sx={{ mb: -2.25, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Typography sx={{ pl: '10px' }} variant="h5">Kartinstanser</Typography>
                    </div>
                </Grid>
                <Grid item xs={12} md={12} lg={12}>
                    <MainCard>
                        <DetailedDataTable
                            data={mapDataToTableFormat(data, mapSpec.specification)}
                            isSearchable={true}
                            pagination={true}
                            rowsPerPage={10}
                            onAdd={handleAddClick}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </MainCard>
                    <FormDialog open={isDialogOpen} onClose={handleDialogClose} title="Skapa ny kartinstans"
                        contentText="Skapa ny kartinstans genom att fylla i titel nedan och trycka Skapa."
                        onSubmit={onSubmit}
                        errorMessage={errorMessage}
                        fieldToValidate="name"
                        textField={<TextField
                            autoFocus
                            onChange={onChange}
                            required
                            margin="dense"
                            id="name"
                            name="name"
                            label="Namn på kartinstans"
                            type="text"
                            fullWidth
                            variant="standard"
                        />} />
                    <AlertDialog open={isAlertDialogOpen} onConfirm={confirmDelete} contentText="Vänligen bekräfta borttagning av kartinstansen!"
                        onClose={() => setAlertDialogOpen(false)} title="Bekräfta borttagning" />
                </Grid>
            </Grid>
        </main >
    )
}
