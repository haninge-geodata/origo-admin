import React from 'react';
import { Box, MenuItem } from '@mui/material';
import { useFormField, useBooleanField, useEnumField } from './hooks/useFormField';
import { getFieldConfig, FieldType, renderEnumOptions } from './fieldRegistry';
import { detectFieldType, validateSchemaForFieldType } from './utils/fieldTypeDetection';
import { ExtendedJSONSchema } from '@/types/jsonSchema';
import { FieldHelpTooltip, hasHelpInfo } from './components/FieldHelpTooltip';

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
  const fieldType = as || detectFieldType(schema);

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

  const fieldConfig = getFieldConfig(fieldType);
  const { component: Component, wrapper: Wrapper, transformProps } = fieldConfig;

  const finalProps = transformProps
    ? transformProps({ ...commonProps, ...componentProps, schema }, schema)
    : { ...commonProps, ...componentProps };

  if (fieldType === 'enum' && 'enumOptions' in hookResult) {
    finalProps.children = renderEnumOptions((schema.enum as string[]) || []);
  }

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

  if (['text', 'number', 'email', 'url', 'password', 'textarea', 'date', 'datetime', 'time', 'color', 'file', 'array-text', 'api-select'].includes(fieldType)) {
    finalProps.label = fieldMeta.title;
    finalProps.placeholder = fieldMeta.placeholder;
  }

  const renderedComponent = <Component {...finalProps} />;

  const needsHelpTooltip = ['text', 'number', 'email', 'url', 'password', 'textarea', 'date', 'datetime', 'time', 'color', 'file', 'array-text'].includes(fieldType);

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

  return renderedComponent;
};

export default Field;