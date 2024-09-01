'use client';
import React from 'react';
import GenericJsonForm from '@/views/generic/GenericJsonFormView';
import { MapControlService } from '@/api';
import { MapControlDto } from "@/shared/interfaces/dtos";

export default function MapControlAddPage() {
    const initialContent = { Example: 'Example' };

    const dtoMapper = (title: string, jsonContent: object): MapControlDto => ({
        title,
        control: jsonContent
    });

    return (
        <GenericJsonForm
            title="Lägg till verktyg"
            service={MapControlService}
            queryKey="mapControls"
            initialJsonContent={initialContent}
            dtoMapper={dtoMapper}
        />
    );
}