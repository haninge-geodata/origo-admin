'use client';
import React from "react";
import LayerWizard from "@/views/wizard/LayerWizard";
import { WMTSLayerService } from "@/api";
import { useWMTSCapabilities } from '@/hooks/capabilities';
import { DataRowToWMTSLayerDto } from "@/utils/mappers";
import tableSpec from "@/assets/specifications/tables/wmtsTableSpecification.json";
import { mapDataToTableFormat } from "@/utils/mappers/toDataTable";

export default function WMTSPage() {
    return (
        <LayerWizard
            title="Lägg till WMTS"
            serviceType="WMTS"
            tableSpec={tableSpec}
            useCapabilities={useWMTSCapabilities}
            mapDataToTableFormat={mapDataToTableFormat}
            mapperFunction={DataRowToWMTSLayerDto}
            layerService={WMTSLayerService}
        />
    );
}