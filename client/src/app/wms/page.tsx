'use client';
import { WMSLayerService } from '@/api';
import wmsSpec from "@/assets/specifications/tables/wmsTableSpecification.json";
import LayersListingView from '@/views/layers/LayersListingView';

export default function WMSPage() {
    return <LayersListingView type="WMS" service={WMSLayerService} specification={wmsSpec.specification} />;
}