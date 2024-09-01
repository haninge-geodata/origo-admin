'use client';
import React from 'react';
import GenericListView from '@/views/generic/GenericListView';
import { LinkResourceService } from '@/api';
import linkSpec from "@/assets/specifications/tables/linkResourceTableSpecification.json";

export default function LinkResourcesPage() {
    return (
        <GenericListView
            queryKey="linkResources"
            headerText="Länkresurser"
            errorMessage="Error Deleting link-resource:"
            service={LinkResourceService}
            specification={linkSpec.specification}
            alertDialogContent="Vänligen bekräfta borttagning av länk-resursen, observera att lager som använder länk-resursen slutar fungera om denna tas bort!"
        />
    );
}