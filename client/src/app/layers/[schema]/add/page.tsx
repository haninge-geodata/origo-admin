'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container, Paper, Alert, CircularProgress, Typography } from '@mui/material';
import { JSONSchemaForm } from '@/components/Forms/JSONSchemaForm';
import { getJSONSchema } from '@/utils/schema/schemaRegistry';
import { findMenuItemByType } from '@/utils/menu/menuLookup';
import { ExtendedJSONSchema } from '@/types/jsonSchema';
import { createMockGenericLayerService } from '@/api/mockGenericLayerService';

interface DynamicSchemaPageProps {
  params: {
    schema: string;
  };
}

export default function DynamicSchemaPage({ params }: DynamicSchemaPageProps) {
  const router = useRouter();
  const [schema, setSchema] = useState<ExtendedJSONSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [menuItem, setMenuItem] = useState<any>(null);
  //TODO: Change to use generic layer service when backend is implemented
  const [service] = useState(() => createMockGenericLayerService(params.schema));

  const schemaType = params.schema;

  useEffect(() => {
    const loadSchema = async () => {
      try {
        setLoading(true);
        setError(null);

        const menuItem = findMenuItemByType(schemaType);
        setMenuItem(menuItem);

        const loadedSchema = await getJSONSchema(menuItem.schemaPath);
        setSchema(loadedSchema);
      } catch (err) {
        console.error(`❌ Failed to load schema for type: ${schemaType}`, err);
        let errorMessage = 'Unknown error occurred';
        if (err instanceof Error) {
          errorMessage = err.message;
        }

        if (errorMessage.includes('No menu item found')) {
          errorMessage = `Schema type "${schemaType}" is not configured in the menu. Available types: geojson. Please check the URL or add a menu configuration.`;
        } else if (errorMessage.includes('has no schemaPath')) {
          errorMessage = `Menu item for "${schemaType}" exists but is missing the "schemaPath" configuration. Please add the schemaPath property to the menu item.`;
        } else if (errorMessage.includes('Schema not found')) {
          errorMessage = `Schema file not found. Please ensure the schema file exists at the specified path in /public/schemas/.`;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadSchema();
  }, [schemaType]);

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      setSubmitting(true);

      console.log(`💾 Form submitted for ${schemaType} with data:`, formData);

      const createdLayer = await service.add(formData as any);

      //TODO: Show toast instead of alert
      alert(`${menuItem?.name || schemaType} layer created successfully!\n\nID: ${createdLayer.id}\nName: ${createdLayer.name}`);

      router.push(`/layers/${schemaType}`);

    } catch (err) {
      console.error(`❌ Failed to save ${schemaType} layer:`, err);
      alert(`Failed to save ${schemaType} layer. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/layers/${schemaType}`);
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
          gap={2}
        >
          <CircularProgress />
          <Typography variant="body1" color="text.secondary">
            Loading {schemaType} form schema...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box mt={4}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" component="div" gutterBottom>
              Failed to Load Form
            </Typography>
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  if (!schema) {
    return (
      <Container maxWidth="md">
        <Box mt={4}>
          <Alert severity="warning">
            Schema loaded but is empty or invalid.
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box mt={4} mb={4}>
        <Paper elevation={1} sx={{ p: 4, mt: 10 }}>
          <JSONSchemaForm
            schema={schema}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={submitting}
            submitText={`Create ${menuItem?.name || 'Layer'}`}
            cancelText="Cancel"
          />
        </Paper>
      </Box>
    </Container>
  );
}