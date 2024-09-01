'use client';
import React from "react";
import LayerWizard from "@/views/wizard/LayerWizard";
import { WMSLayerService } from "@/api";
import { useWMSCapabilities } from '@/hooks/capabilities';
import { DataRowToWMSLayerDto } from "@/utils/mappers";
import tableSpec from "@/assets/specifications/tables/wmsTableSpecification.json";
import { mapDataToTableFormat } from "@/utils/mappers/toDataTable";

export default function WMSPage() {
    return (
        <LayerWizard
            title="Lägg till WMS"
            serviceType="WMS"
            tableSpec={tableSpec}
            useCapabilities={useWMSCapabilities}
            mapDataToTableFormat={mapDataToTableFormat}
            mapperFunction={DataRowToWMSLayerDto}
            layerService={WMSLayerService}
        />
    );
}