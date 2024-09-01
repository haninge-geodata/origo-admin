'use client';
import React from 'react';
import GenericListView from '@/views/generic/GenericListView';
import { MapSettingService } from '@/api';
import spec from "@/assets/specifications/tables/mapSettingTableSpecification.json";

export default function MapControlsPage() {
    return (
        <GenericListView
            queryKey="mapSettings"
            headerText="Kartinställningar"
            errorMessage="Error Deleting map settings:"
            service={MapSettingService}
            specification={spec.specification}
            expandable={true}
            alertDialogContent="Vänligen bekräfta borttagning av kartinställningarna!"
        />
    );
}