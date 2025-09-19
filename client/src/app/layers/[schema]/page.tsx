'use client';

import React from 'react';
import GenericLayersListingView from '@/views/layers/GenericLayersListingView';

interface GenericSchemaListPageProps {
  params: {
    schema: string;
  };
}

export default function GenericSchemaListPage({ params }: GenericSchemaListPageProps) {
  const schemaType = params.schema;

  return <GenericLayersListingView schemaType={schemaType} />;
}