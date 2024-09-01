'use client';
import { WFSLayerService } from '@/api';
import wfsSpec from "@/assets/specifications/tables/wfsTableSpecification.json";
import LayersListingView from '@/views/layers/LayersListingView';

export default function WFSPage() {
    return <LayersListingView type="WFS" service={WFSLayerService} specification={wfsSpec.specification} />;
}