'use client';
import React from 'react';
import LayerEditView from '@/views/layers/LayerEditView';
import { WMTSLayerService } from '@/api';
import { DataRowToWMTSLayerDto } from "@/utils/mappers";
import spec from "@/assets/specifications/tables/wmtsTableSpecification.json";

export default function WMTSEditPage({ params: { id } }: any) {
    return (
        <LayerEditView
            id={id}
            title="Uppdatera WMTS"
            queryKey="wmtsLayer"
            service={WMTSLayerService}
            mapper={DataRowToWMTSLayerDto}
            specification={spec}
            layerType="wmts"
        />
    );
}