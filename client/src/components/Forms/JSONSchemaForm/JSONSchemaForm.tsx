import React, { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  LinearProgress,
  Chip,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { JSONSchemaFormProps } from './types';
import { Field } from './Field';
import { jsonSchemaToZod } from '@/utils/schema/jsonSchemaToZod';
import { ExtendedJSONSchema } from '@/types/jsonSchema';

const FULL_WIDTH_COMPONENTS = [
  'textarea',
  'json-editor',
  'key-value',
  'object'
] as const;


const pluralize = (count: number, word: string): string =>
  `${count} ${word}${count !== 1 ? 's' : ''}`;


const getFormStatusMessage = (errorCount: number, completion: number, totalFields: number, filledFields: number): string => {
  if (errorCount > 0) {
    return `Please fix ${pluralize(errorCount, 'error')} before submitting`;
  }
  if (completion === 100) {
    return 'Form is ready to submit!';
  }
  const remaining = totalFields - filledFields;
  return `${pluralize(remaining, 'field')} remaining`;
};


const getProgressColor = (errorCount: number, completion: number): string => {
  if (errorCount > 0) return 'warning.main';
  if (completion === 100) return 'success.main';
  return 'primary.main';
};


const getButtonColors = (errorCount: number) => ({
  main: errorCount > 0 ? 'warning.main' : 'primary.main',
  hover: errorCount > 0 ? 'warning.dark' : 'primary.dark'
});

interface FieldGroup {
  type: 'single' | 'inline' | 'row';
  fields: Array<[string, ExtendedJSONSchema]>;
  priority: number;
}

const createFieldGroups = (fields: Array<[string, ExtendedJSONSchema]>): FieldGroup[] => {
  const sortedFields = [...fields].sort(([nameA, schemaA], [nameB, schemaB]) => {
    const priorityA = (schemaA['x-ui']?.layout?.priority ?? 999);
    const priorityB = (schemaB['x-ui']?.layout?.priority ?? 999);
    return priorityA - priorityB;
  });

  const groups: FieldGroup[] = [];
  const processedFields = new Set<string>();

  const namedGroups: Record<string, Array<[string, ExtendedJSONSchema]>> = {};

  sortedFields.forEach(([fieldName, fieldSchema]) => {
    if (processedFields.has(fieldName)) return;

    const layout = fieldSchema['x-ui']?.layout;
    const groupName = layout?.group;

    if (groupName) {
      if (!namedGroups[groupName]) {
        namedGroups[groupName] = [];
      }
      namedGroups[groupName].push([fieldName, fieldSchema]);
      processedFields.add(fieldName);
    }
  });

  Object.entries(namedGroups).forEach(([groupName, groupFields]) => {
    const hasOnlyCheckboxes = groupFields.every(([, schema]) =>
      schema.type === 'boolean'
    );

    if (hasOnlyCheckboxes && groupFields.length <= 4) {
      groups.push({
        type: 'inline',
        fields: groupFields,
        priority: Math.min(...groupFields.map(([, s]) => s['x-ui']?.layout?.priority ?? 999))
      });
    } else {
      groups.push({
        type: 'row',
        fields: groupFields,
        priority: Math.min(...groupFields.map(([, s]) => s['x-ui']?.layout?.priority ?? 999))
      });
    }
  });

  sortedFields.forEach(([fieldName, fieldSchema]) => {
    if (processedFields.has(fieldName)) return;

    groups.push({
      type: 'single',
      fields: [[fieldName, fieldSchema]],
      priority: fieldSchema['x-ui']?.layout?.priority ?? 999
    });
    processedFields.add(fieldName);
  });

  return groups.sort((a, b) => a.priority - b.priority);
};

const getGroupFieldSize = (
  fieldSchema: ExtendedJSONSchema,
  groupType: FieldGroup['type'],
  fieldsInGroup: number
): number => {
  const layout = fieldSchema['x-ui']?.layout;

  if (layout?.width) {
    switch (layout.width) {
      case 'full': return 12;
      case 'half': return 6;
      case 'third': return 4;
      case 'quarter': return 3;
      case 'auto': break;
    }
  }

  switch (groupType) {
    case 'inline':
      return Math.max(3, Math.floor(12 / Math.min(fieldsInGroup, 4)));

    case 'row':
      if (fieldsInGroup === 1) return 12;
      if (fieldsInGroup === 2) return 6;
      if (fieldsInGroup === 3) return 4;
      return 3;

    case 'single':
      const componentType = fieldSchema['x-ui']?.component;
      if (componentType && FULL_WIDTH_COMPONENTS.includes(componentType as any)) {
        return 12;
      }
      if (fieldSchema.type === 'string' &&
        (fieldSchema.format === 'binary' || (fieldSchema.maxLength && fieldSchema.maxLength > 100))) {
        return 12;
      }
      if (fieldSchema.type === 'object' || fieldSchema.type === 'array') {
        return 12;
      }
      return 6;
  }
};

const renderSection = (
  section: { title: string; description?: string; collapsible?: boolean; defaultCollapsed?: boolean },
  sectionContent: React.ReactNode,
  key: string
): React.ReactElement => {
  if (section.collapsible) {
    return (
      <Grid item xs={12} key={key}>
        <Accordion
          defaultExpanded={!section.defaultCollapsed}
          sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              bgcolor: 'grey.50',
              borderRadius: 2,
              '&.Mui-expanded': {
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              }
            }}
          >
            <Box>
              <Typography variant="h6" component="h3">
                {section.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {section.description}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 3 }}>
            {sectionContent}
          </AccordionDetails>
        </Accordion>
      </Grid>
    );
  }

  return (
    <Grid item xs={12} key={key}>
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            {section.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {section.description}
          </Typography>
          <Divider />
        </Box>
        {sectionContent}
      </Paper>
    </Grid>
  );
};

export const JSONSchemaForm: React.FC<JSONSchemaFormProps> = ({
  schema,
  initialValues = {},
  onSubmit,
  onCancel,
  loading = false,
  submitText = 'Save',
  cancelText = 'Cancel',
}) => {
  const defaultValues = useMemo(() => {
    const values: Record<string, any> = { ...initialValues };

    if (schema.properties) {
      Object.entries(schema.properties).forEach(([key, property]) => {
        if (values[key] === undefined && property.default !== undefined) {
          values[key] = property.default;
        }
      });
    }

    return values;
  }, [schema, initialValues]);

  const zodSchema = useMemo(() => {
    try {
      return jsonSchemaToZod(schema);
    } catch (error) {
      console.error('Failed to convert JSON Schema to Zod:', error);
      return null;
    }
  }, [schema]);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
  } = useForm({
    resolver: zodSchema ? zodResolver(zodSchema) : undefined,
    defaultValues: defaultValues,
    mode: 'onChange',
  });

  const formValues = watch();

  const formStats = useMemo(() => {
    const errorCount = Object.keys(errors).length;
    const schemaProperties = schema.properties || {};
    const totalFields = Object.keys(schemaProperties).length;
    const filledFields = totalFields > 0
      ? Object.keys(schemaProperties).filter(field => {
        const value = formValues[field];
        return value !== undefined && value !== null && value !== '';
      }).length
      : 0;
    const completion = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;

    return { completion, totalFields, filledFields, errorCount };
  }, [errors, formValues, schema.properties]);

  const buttonColors = getButtonColors(formStats.errorCount);

  const onFormSubmit = (data: Record<string, any>) => {
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    );

    onSubmit(cleanedData);
  };

  if (!zodSchema) {
    return (
      <Alert severity="error">
        Failed to process form schema. Please check the schema format.
      </Alert>
    );
  }

  const fieldSections = useMemo(() => {
    if (!schema.properties) return [];

    const fields = Object.entries(schema.properties);

    if (schema['x-ui']?.sections) {
      const schemaSections = schema['x-ui'].sections;

      const fieldSectionAssignments: Record<string, [string, any][]> = {};

      fields.forEach(([name, fieldSchema]) => {
        const fieldSection = (fieldSchema as any)['x-ui']?.section || 'misc';

        if (!fieldSectionAssignments[fieldSection]) {
          fieldSectionAssignments[fieldSection] = [];
        }
        fieldSectionAssignments[fieldSection].push([name, fieldSchema]);
      });

      const sectionsToProcess = Array.isArray(schemaSections)
        ? schemaSections.map(section => [section.name, section] as [string, any])
        : Object.entries(schemaSections);

      const orderedSections = sectionsToProcess
        .sort(([, a], [, b]) => (a.order || 999) - (b.order || 999))
        .map(([sectionName, sectionConfig]) => {
          const sectionFields = fieldSectionAssignments[sectionName] || [];

          if (sectionFields.length === 0) return null;

          return {
            title: sectionConfig.title || sectionName.charAt(0).toUpperCase() + sectionName.slice(1),
            description: sectionConfig.description || `${sectionName} configuration`,
            collapsible: sectionConfig.collapsible ?? false,
            defaultCollapsed: sectionConfig.defaultCollapsed ?? false,
            required: sectionConfig.required,
            fields: sectionFields
          };
        })
        .filter(Boolean);

      const assignedFields = orderedSections.flatMap(s => s?.fields.map(f => f[0]) || []);
      const remainingFields = fields.filter(([name]) => !assignedFields.includes(name));

      if (remainingFields.length > 0) {
        orderedSections.push({
          title: 'Additional Fields',
          description: 'Other configuration options',
          collapsible: true,
          defaultCollapsed: true,
          required: false,
          fields: remainingFields
        });
      }

      return orderedSections;
    }

    console.warn('Schema missing required x-ui.sections definition:', {
      schema: schema.title || 'Unknown Schema',
      fieldCount: fields.length,
      message: 'All schemas must define sections explicitly in x-ui.sections'
    });

    return [{
      title: 'Configuration',
      description: 'Schema configuration (sections not defined)',
      collapsible: false,
      defaultCollapsed: false,
      fields: fields
    }];
  }, [schema.properties, schema['x-ui']]);

  const renderField = (
    fieldName: string,
    fieldSchema: ExtendedJSONSchema,
    groupType: FieldGroup['type'],
    fieldsInGroup: number
  ) => {
    const fieldError = errors[fieldName]?.message as string | undefined;

    return (
      <Controller
        key={fieldName}
        name={fieldName}
        control={control}
        render={({ field: { onChange, onBlur, value, name } }) => (
          <Field
            name={name}
            schema={fieldSchema}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            error={fieldError}
            disabled={loading}
          />
        )}
      />
    );
  };

  const renderFields = () => {
    if (!schema.properties) {
      return (
        <Alert severity="warning">
          No form fields defined in schema.
        </Alert>
      );
    }

    return fieldSections.map((section, sectionIndex) => {
      if (!section) return null;

      const fieldGroups = createFieldGroups(section.fields);

      const sectionContent = (
        <Grid container spacing={2}>
          {fieldGroups.map((group, groupIndex) => {
            const groupKey = `group-${sectionIndex}-${groupIndex}`;

            if (group.type === 'inline') {
              return (
                <Grid item xs={12} key={groupKey}>
                  <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    alignItems: 'center',
                    mt: 1,
                    p: 2,
                    backgroundColor: 'grey.50',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'grey.200'
                  }}>
                    {group.fields.map(([fieldName, fieldSchema]) => (
                      <Box key={fieldName} sx={{ minWidth: 'fit-content' }}>
                        {renderField(fieldName, fieldSchema as ExtendedJSONSchema, group.type, group.fields.length)}
                      </Box>
                    ))}
                  </Box>
                </Grid>
              );
            }

            if (group.type === 'row' && group.fields.length > 1) {
              return (
                <Grid item xs={12} key={groupKey}>
                  <Box sx={{
                    p: 2,
                    backgroundColor: 'grey.25',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'grey.100'
                  }}>
                    <Grid container spacing={2}>
                      {group.fields.map(([fieldName, fieldSchema]) => {
                        const fieldSize = getGroupFieldSize(
                          fieldSchema as ExtendedJSONSchema,
                          group.type,
                          group.fields.length
                        );

                        return (
                          <Grid item xs={12} md={fieldSize} key={fieldName}>
                            {renderField(fieldName, fieldSchema as ExtendedJSONSchema, group.type, group.fields.length)}
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                </Grid>
              );
            }

            return group.fields.map(([fieldName, fieldSchema]) => {
              const fieldSize = getGroupFieldSize(
                fieldSchema as ExtendedJSONSchema,
                group.type,
                group.fields.length
              );

              return (
                <Grid item xs={12} md={fieldSize} key={fieldName}>
                  {renderField(fieldName, fieldSchema as ExtendedJSONSchema, group.type, group.fields.length)}
                </Grid>
              );
            });
          })}
        </Grid>
      );

      return renderSection(section, sectionContent, section.title);
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onFormSubmit)} noValidate>
      {schema.title && (
        <Typography variant="h4" component="h1" gutterBottom>
          {schema.title}
        </Typography>
      )}

      {schema.description && (
        <Typography variant="body1" color="text.secondary" paragraph>
          {schema.description}
        </Typography>
      )}

      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 2, sm: 0 },
          mb: 2
        }}>
          <Typography variant="subtitle2" color="text.primary">
            Form Progress
          </Typography>
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            alignSelf: { xs: 'stretch', sm: 'auto' }
          }}>
            <Chip
              label={`${formStats.completion}% Complete`}
              color={formStats.completion === 100 ? 'success' : 'primary'}
              size="small"
            />
            <Chip
              label={`${formStats.filledFields}/${formStats.totalFields} Fields`}
              variant="outlined"
              size="small"
            />
            {formStats.errorCount > 0 && (
              <Chip
                label={pluralize(formStats.errorCount, 'Error')}
                color="error"
                size="small"
              />
            )}
          </Box>
        </Box>
        <LinearProgress
          variant="determinate"
          value={formStats.completion}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              backgroundColor: getProgressColor(formStats.errorCount, formStats.completion)
            }
          }}
        />
      </Paper>

      <Grid container spacing={2}>
        {renderFields()}
      </Grid>

      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mt: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: 2, sm: 0 }
        }}>
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="body2" color="text.secondary">
              {getFormStatusMessage(formStats.errorCount, formStats.completion, formStats.totalFields, formStats.filledFields)}
            </Typography>
          </Box>

          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            alignItems: 'center'
          }}>
            <Chip
              label={isDirty ? 'Unsaved changes' : 'All changes saved'}
              color={isDirty ? 'warning' : 'success'}
              variant="outlined"
              size="small"
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            />

            {onCancel && (
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={loading}
                sx={{
                  minWidth: { xs: '100%', sm: 100 },
                  order: { xs: 2, sm: 1 }
                }}
              >
                {cancelText}
              </Button>
            )}

            <Button
              type="submit"
              variant="contained"
              disabled={loading || !isValid}
              startIcon={loading ? <CircularProgress size={20} /> : undefined}
              sx={{
                minWidth: { xs: '100%', sm: 140 },
                order: { xs: 1, sm: 2 },
                bgcolor: buttonColors.main,
                '&:hover': {
                  bgcolor: buttonColors.hover,
                }
              }}
            >
              {loading ? 'Saving...' : submitText}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};