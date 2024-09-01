'use client';
import { WMTSLayerService } from '@/api';
import wmtsSpec from "@/assets/specifications/tables/wfsTableSpecification.json";
import LayersListingView from '@/views/layers/LayersListingView';

export default function WMTSPage() {
    return <LayersListingView type="WMTS" service={WMTSLayerService} specification={wmtsSpec.specification} />;
}