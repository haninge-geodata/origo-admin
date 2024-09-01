'use client';
import React from 'react';
import GenericListView from '@/views/generic/GenericListView';
import { MapControlService } from '@/api';
import spec from "@/assets/specifications/tables/mapControlTableSpecification.json";

export default function MapControlsPage() {
    return (
        <GenericListView
            queryKey="mapControls"
            headerText="Verktyg"
            errorMessage="Error Deleting map control:"
            service={MapControlService}
            specification={spec.specification}
            expandable={true}
            alertDialogContent="Vänligen bekräfta borttagning av verktyget!"
        />
    );
}