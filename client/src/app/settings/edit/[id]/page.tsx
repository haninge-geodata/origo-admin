'use client';
import React from 'react';
import GenericJsonForm from '@/views/generic/GenericJsonFormView';
import { MapSettingService } from '@/api';
import { MapSettingDto } from "@/shared/interfaces/dtos";

export default function MapSettingEditPage({ params: { id } }: { params: { id: string } }) {
    const initialContent = { Example: 'Example' };

    const dtoMapper = (title: string, jsonContent: object, id?: string): MapSettingDto => ({
        id,
        title,
        setting: jsonContent
    });

    return (
        <GenericJsonForm
            id={id}
            title="Uppdatera kartinställning"
            service={MapSettingService}
            queryKey="mapSettings"
            initialJsonContent={initialContent}
            dtoMapper={dtoMapper}
        />
    );
}