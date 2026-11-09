import React from 'react';
import { Box, MenuItem } from '@mui/material';
import { useFormField, useBooleanField, useEnumField } from './hooks/useFormField';
import { getFieldConfig, FieldType, renderEnumOptions } from './fieldRegistry';
import { detectFieldType, validateSchemaForFieldType } from './utils/fieldTypeDetection';
import { ExtendedJSONSchema } from '@/shared/interfaces/jsonSchema.interface';
import { FieldHelpTooltip, hasHelpInfo } from './components/FieldHelpTooltip';
import { FIELD_TYPES_WITH_LABELS, FIELD_TYPES_WITH_HELP_TOOLTIP } from './constants/fieldTypes';

/**
 * Field Rendering Pipeline:
 * 
 * 1. Determine field type (explicit via 'as' prop or auto-detect from schema)
 * 2. Validate schema matches the field type (dev warning if mismatch)
 * 3. Get appropriate hook based on field type (useFormField, useBooleanField, useEnumField)
 * 4. Handle render prop pattern if provided (children callback)
 * 5. Get component configuration from registry (TextField, Switch, Select, etc.)
 * 6. Transform props using registry's transform function (customization point)
 * 7. Handle special cases:
 *    - Enum fields: Add MenuItem children for options
 *    - Multi-select: Build options from schema or x-ui config
 *    - Text fields: Add label and placeholder
 * 8. Render the base component
 * 9. Add help tooltip for fields with constraints/examples (text fields)
 * 10. Wrap in custom wrapper if provided by registry (booleans, enums, etc.)
 * 11. Return final rendered component
 */

export interface FieldProps {
  schema: ExtendedJSONSchema;
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  as?: FieldType;
  name?: string;
  children?: (props: {
    commonProps: any;
    componentProps: any;
    fieldMeta: any;
    fieldType: FieldType;
  }) => React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({
  schema,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  as,
  name,
  children,
}) => {
  // Step 1: Determine field type (explicit or auto-detect)
  const fieldType = as || detectFieldType(schema);

  // Step 2: Validate schema matches field type (dev warnings only)
  const isValidSchema = validateSchemaForFieldType(schema, fieldType);

  if (!isValidSchema && process.env.NODE_ENV === 'development') {
    const shouldLog = !as && fieldType === 'text';
    if (shouldLog) {
      console.warn(`Schema auto-detection fallback for field '${schema.title || name}':`, {
        detectedType: fieldType,
        schemaType: schema.type,
        suggestion: 'Consider adding x-ui.component to schema for explicit field type'
      });
    }
  }

  // Step 3: Get appropriate hook based on field type
  const getFieldHookResult = () => {
    const baseProps = { schema, value, onChange, onBlur, error, disabled };

    switch (fieldType) {
      case 'boolean':
        return useBooleanField(baseProps);

      case 'enum':
        return useEnumField(baseProps);

      default:
        return useFormField(baseProps);
    }
  };

  const hookResult = getFieldHookResult();
  const { commonProps, componentProps, fieldMeta } = hookResult;

  // Step 4: Handle render prop pattern (allows custom rendering)
  if (children) {
    return (
      <>
        {children({
          commonProps,
          componentProps,
          fieldMeta,
          fieldType,
        })}
      </>
    );
  }

  // Step 5: Get component configuration from registry
  const fieldConfig = getFieldConfig(fieldType);
  const { component: Component, wrapper: Wrapper, transformProps } = fieldConfig;

  // Step 6: Transform props (registry can customize behavior)
  const finalProps = transformProps
    ? transformProps({ ...commonProps, ...componentProps, schema }, schema)
    : { ...commonProps, ...componentProps };

  // Step 7: Handle special cases
  
  // Enum fields need MenuItem children
  if (fieldType === 'enum' && 'enumOptions' in hookResult) {
    finalProps.children = renderEnumOptions((schema.enum as string[]) || []);
  }

  // Multi-select needs options from schema or x-ui config
  if (fieldType === 'multi-select') {
    let options: Array<{ value: any; label: string }> = [];

    if (schema['x-ui']?.options && Array.isArray(schema['x-ui'].options)) {
      options = schema['x-ui'].options;
    }
    else if (!Array.isArray(schema.items) && schema.items?.enum && Array.isArray(schema.items.enum)) {
      options = schema.items.enum.map((value: any) => ({
        value: value,
        label: String(value)
      }));
    }

    finalProps.children = options.map((option) =>
      React.createElement(MenuItem, {
        key: option.value,
        value: option.value
      }, option.label)
    );
  }

  // Text-based fields need label and placeholder
  if (FIELD_TYPES_WITH_LABELS.includes(fieldType as any)) {
    finalProps.label = fieldMeta.title;
    finalProps.placeholder = fieldMeta.placeholder;
  }

  // Step 8: Render the base component
  const renderedComponent = <Component {...finalProps} />;

  // Step 9: Add help tooltip for fields with constraints/examples
  const needsHelpTooltip = FIELD_TYPES_WITH_HELP_TOOLTIP.includes(fieldType as any);

  if (needsHelpTooltip && hasHelpInfo(schema)) {
    return (
      <Box sx={{ position: 'relative' }}>
        {renderedComponent}
        <Box sx={{ position: 'absolute', top: 16, right: 8 }}>
          <FieldHelpTooltip schema={schema} fieldName={name || 'field'} />
        </Box>
      </Box>
    );
  }

  // Step 10: Wrap in custom wrapper if provided (for booleans, enums, etc.)
  if (Wrapper) {
    return (
      <Wrapper
        commonProps={commonProps}
        componentProps={componentProps}
        fieldMeta={fieldMeta}
        fieldType={fieldType}
        schema={schema}
      >
        {renderedComponent}
      </Wrapper>
    );
  }

  // Step 11: Return the final rendered component
  return renderedComponent;
};

export default Field;