import DetailedDataTable from "@/components/Tables/DetailedDataTable";
import { Box, Grid, Button } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MapInstanceService as service } from '@/api';
import { mapDataToTableFormat } from "@/utils/mappers/toDataTable";
import spec from "@/assets/specifications/tables/mapInstancePublishTableSpecification.json";
import AlertDialog from "@/components/Dialogs/AlertDialog";
import { useEffect, useState } from "react";
import MainCard from "@/components/Cards/MainCard/MainCard";
import envStore from "@/stores/Environment";
import { Pageview } from "@mui/icons-material";

interface PublishProps {
    id: string;
}

const Publish = ({ id }: PublishProps) => {
    const queryClient = useQueryClient();
    const [openModal, setOpenModal] = useState(false);
    const queryKey = "list";
    const { data } = useQuery({ queryKey: [queryKey], queryFn: () => service.fetchPublishedList(id) });
    const [isConfirmRepublishDialogOpen, setConfirmRepublishDialogOpen] = useState(false);
    const [selectedInstance, setSelectedInstance] = useState<any>();
    const [origoUrl, setOrigoUrl] = useState('');

    useEffect(() => {
        const fetchBaseUrl = async () => {
            const origoUrl = await envStore("ORIGO_URL");
            setOrigoUrl(origoUrl);
        };
        fetchBaseUrl();
    }, []);

    const onModalConfirm = () => {
        setOpenModal(false);
        handleSave();
    }

    const onModalCancel = () => {
        setOpenModal(false);
    }

    const handlePublish = () => {
        setOpenModal(true);
    }

    const handleSave = async () => {
        const resp = await service.publish(id);
        queryClient.invalidateQueries({ queryKey: [queryKey] });
    };

    const handleRepublish = async (id: string) => {
        const selectedInstance = data!.find((instance: any) => instance.id === id);
        setSelectedInstance(selectedInstance);
        setConfirmRepublishDialogOpen(true);
    };

    const confirmRepublish = async () => {
        await service.republish(id, selectedInstance!.id);
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        handleRepublishDialogClose();
    }

    const handleRepublishDialogClose = () => {
        setConfirmRepublishDialogOpen(false);
        setSelectedInstance(undefined);
    }

    const handlePreview = (instanceId: string) => {
        window.open(`${origoUrl}/${instanceId}/preview`, '_blank');
    }

    const handleGlobalPreview = () => {
        window.open(`${origoUrl}/${id}/preview`, '_blank');
    }

    return (
        <Box component='div'>
            <Grid item xs={12} md={12} lg={12}>
                <MainCard>
                    <>
                        <Box sx={{ position: 'relative', mb: 2 }}>
                            <>
                                <Button onClick={handleGlobalPreview}
                                    variant="contained"
                                    startIcon={<Pageview />}
                                    sx={{
                                        position: 'relative',
                                        top: 0,
                                        right: 0,
                                        zIndex: 1,
                                        color: 'white'
                                    }}
                                >Förhandsgranska
                                </Button>
                            </>
                        </Box>
                        {data &&
                            <DetailedDataTable
                                data={mapDataToTableFormat(data!, spec.specification)}
                                onAdd={handlePublish}
                                pagination={true}
                                rowsPerPage={10}
                                customEvents={[
                                    { label: "Ompublicera", action: (id) => handleRepublish(id) },
                                    { label: "Förhandsgranska", action: (id) => handlePreview(id) },
                                ]}
                                customOnAddLabel="Publicera"
                            ></DetailedDataTable>}
                    </>
                </MainCard>
            </Grid>
            <AlertDialog title={`Publicera kartinstans?`} contentText={'Bekräfta publicering av kartinstans, detta kommer ersätta eventuellt existerande kartinstans!'}
                open={openModal} onClose={onModalCancel} onConfirm={onModalConfirm}></AlertDialog>
            <AlertDialog open={isConfirmRepublishDialogOpen} onClose={() => setConfirmRepublishDialogOpen(false)} title="Ompublicera kartinstans" contentText={`Är du säker på att du vill ompublicera kartinstansen "${selectedInstance?.title}"?`}
                onConfirm={confirmRepublish} />
        </Box>
    );
};

export default Publish;