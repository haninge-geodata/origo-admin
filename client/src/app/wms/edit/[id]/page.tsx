'use client';
import React from 'react';
import LayerEditView from '@/views/layers/LayerEditView';
import { WMSLayerService } from '@/api';
import { DataRowToWMSLayerDto } from "@/utils/mappers";
import spec from "@/assets/specifications/tables/wmsTableSpecification.json";

export default function WMSEditPage({ params: { id } }: any) {
    return (
        <LayerEditView
            id={id}
            title="Uppdatera WMS"
            queryKey="wmslayers"
            service={WMSLayerService}
            mapper={DataRowToWMSLayerDto}
            specification={spec}
            layerType="wms"
        />
    );
}