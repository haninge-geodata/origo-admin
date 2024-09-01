import React, { useState, useEffect } from "react";
import { Stepper, Step, StepLabel, Button, Grid } from "@mui/material";
import MainCard from "@/components/Cards/MainCard/MainCard";
import styles from "@/app/page.module.css";
import { DataRow, TableData } from "@/interfaces";
import { SelectSourceAndLayers } from "@/views/wizard/SelectSourceAndLayers";
import HandleLayers from "@/views/wizard/HandleLayers";
import { Complete } from "@/views/wizard/Complete";
import { useRouter } from "next/navigation";
import { LinkResourceDto } from "@/shared/interfaces/dtos";
import { useQuery } from "@tanstack/react-query";
import { LinkResourceService as linkResourceService } from "@/api";

const steps = ["Välj lager", "Ändra lagerinformation", "Granska & Spara"];

interface LayerWizardProps {
    title: string;
    serviceType: 'WFS' | 'WMS' | 'WMTS';
    tableSpec: any;
    useCapabilities: () => { loadCapabilities: (url: string) => Promise<any> };
    mapDataToTableFormat: (data: any[], spec: any) => TableData;
    mapperFunction: (rows: DataRow[], source: LinkResourceDto) => any;
    layerService: {
        addRange: (dtos: any) => Promise<any>;
    };
    customOnSearchClick?: (
        selectedSourceId: string,
        sources: LinkResourceDto[],
        useCapabilities: () => { loadCapabilities: (url: string) => Promise<any> },
        tableSpec: any,
        mapDataToTableFormat: (data: any[], spec: any) => TableData
    ) => Promise<TableData>;
    updateRowsWithDescribeResponse?: (
        mappedData: TableData,
        describeResponse: Record<string, [string, string][]>
    ) => TableData;
}

export default function LayerWizard({
    title,
    serviceType,
    tableSpec,
    useCapabilities,
    mapDataToTableFormat,
    mapperFunction,
    layerService,
    customOnSearchClick,
}: LayerWizardProps) {
    const router = useRouter();
    const { data, isLoading } = useQuery({
        queryKey: ["linkResources"],
        queryFn: () => linkResourceService.fetchByType(serviceType),
    });

    const [sources, setSources] = useState<LinkResourceDto[]>([]);
    const [selectedSource, setSelectedSource] = useState<LinkResourceDto>();
    const [selectedSourceId, setSelectedSourceId] = useState<string>("");
    const [tableData, setTableData] = useState<TableData>();
    const [selectedRows, setSelectedRows] = useState<DataRow[]>([]);

    const [areLayersSelected, setAreLayersSelected] = useState(false);
    const [areHandleLayersValid, setAreHandleLayersValid] = useState(false);
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        if (data) {
            setSources(data);
        }
    }, [data]);

    useEffect(() => {
        setAreLayersSelected(selectedRows.length > 0);
    }, [selectedRows]);

    const setSelectedSourceAndId = (source: LinkResourceDto) => {
        setSelectedSource(source);
        setSelectedSourceId(source.id!);
    };

    const updateDataRow = (updatedRow: DataRow) => {
        const newSelectedRows = selectedRows.map(row =>
            row.id === updatedRow.id ? updatedRow : row
        );
        setSelectedRows(newSelectedRows);
        if (tableData && tableData.rows) {
            const newTableDataRows = tableData.rows.map(row =>
                row.id === updatedRow.id ? updatedRow : row
            );
            setTableData({ ...tableData, rows: newTableDataRows });
        }
    };

    const onSearchClick = async () => {
        if (customOnSearchClick) {
            const newTableData = await customOnSearchClick(
                selectedSourceId,
                sources,
                useCapabilities,
                tableSpec,
                mapDataToTableFormat
            );
            setTableData(newTableData);
        } else {
            const capabilitiesHook = useCapabilities();
            if (selectedSourceId) {
                const selectedSource = sources?.find(source => source.id === selectedSourceId);
                const response = await capabilitiesHook.loadCapabilities(selectedSource!.url);
                const mappedData = mapDataToTableFormat(response.Layers, tableSpec.specification);
                setTableData(mappedData);
            }
        }
    };

    const onRowsSelectionChanged = (ids: string[]) => {
        setSelectedRows((prevRows) => {
            const prevSelectedIds = new Set(prevRows.map(row => row.id.toString()));

            const rowsToAdd = ids
                .filter(id => !prevSelectedIds.has(id))
                .map(id => tableData?.rows.find(row => row.id.toString() === id))
                .filter((row): row is NonNullable<typeof row> => row !== undefined);

            const rowsToKeep = prevRows.filter(row => ids.includes(row.id.toString()));

            return [...rowsToKeep, ...rowsToAdd];
        });
    };

    const handleNextDisabled = () => {
        if (activeStep === 0) return !areLayersSelected;
        if (activeStep === 1) return !areHandleLayersValid;
        return false;
    };

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleFinish = async () => {
        try {
            const dtos = mapperFunction(selectedRows, selectedSource!);
            await layerService.addRange(dtos);
            setActiveStep(activeStep + 1);
            router.back();
        } catch (error) {
            console.error("Error adding link resource:", error);
        }
    };

    function StepContent({ stepIndex }: { stepIndex: number }) {
        switch (stepIndex) {
            case 0:
                return (
                    <SelectSourceAndLayers
                        onDataFromSource={setTableData}
                        sources={sources}
                        selectedSourceId={selectedSourceId}
                        specification={tableSpec.specification}
                        onSearchClick={onSearchClick}
                        setSelectedSource={setSelectedSourceAndId}
                        selectedRows={selectedRows}
                        tableData={tableData}
                        onRowsSelectionChanged={onRowsSelectionChanged}
                    />
                );
            case 1:
                return (
                    <HandleLayers
                        selectedRows={selectedRows}
                        updateDataRow={updateDataRow}
                        columns={tableData!.columns}
                        setAreHandleLayersValid={setAreHandleLayersValid}
                    />
                );
            case 2:
                return <Complete selectedRows={selectedRows} selectedSource={selectedSource!} />;
            default:
                return null;
        }
    }

    if (isLoading) return <div>Loading...</div>;

    return (
        <main className={styles.main}>
            <Grid container columnSpacing={2.75}>
                <Grid item xs={12}>
                    <MainCard title={title}>
                        <Grid sx={{ my: "40px" }}>
                            <Stepper activeStep={activeStep}>
                                {steps.map((label) => (
                                    <Step key={label}>
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                        </Grid>
                        <Grid sx={{ my: "40px" }}>
                            <StepContent stepIndex={activeStep} />
                        </Grid>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                paddingTop: 16,
                            }}
                        >
                            {activeStep > 0 && (
                                <Button
                                    onClick={handleBack}
                                    sx={{
                                        color: "blue",
                                        backgroundColor: "transparent",
                                        ":hover": { backgroundColor: "transparent" },
                                    }}
                                >
                                    Föregående steg
                                </Button>
                            )}
                            <div></div>
                            {activeStep < steps.length - 1 ? (
                                <Button disabled={handleNextDisabled()} onClick={handleNext}>
                                    {activeStep === steps.length - 2 ? "Granska" : "Nästa"}
                                </Button>
                            ) : activeStep === steps.length - 1 ? (
                                <Button onClick={handleFinish}>Spara</Button>
                            ) : null}
                        </div>
                    </MainCard>
                </Grid>
            </Grid>
        </main>
    );
}