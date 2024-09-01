'use client';
import React from 'react';
import GenericJsonForm from '@/views/generic/GenericJsonFormView';
import { MapSettingService } from '@/api';
import { MapSettingDto } from "@/shared/interfaces/dtos";

export default function MapSettingAddPage() {
    const initialContent = { Example: 'Example' };

    const dtoMapper = (title: string, jsonContent: object): MapSettingDto => ({
        title,
        setting: jsonContent
    });

    return (
        <GenericJsonForm
            title="Lägg till kartinställning"
            service={MapSettingService}
            queryKey="mapSettings"
            initialJsonContent={initialContent}
            dtoMapper={dtoMapper}
        />
    );
}