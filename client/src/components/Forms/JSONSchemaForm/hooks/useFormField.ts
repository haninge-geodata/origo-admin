import { useMemo } from "react";
import { ExtendedJSONSchema } from "@/shared/interfaces";

interface UseFormFieldProps {
  schema: ExtendedJSONSchema;
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
}

interface FormFieldResult {
  commonProps: {
    value: any;
    onChange: (event: any) => void;
    onBlur?: () => void;
    error: boolean;
    helperText: string;
    disabled: boolean;
    required: boolean;
    fullWidth: boolean;
    margin: "normal";
  };
  componentProps: {
    [key: string]: any;
  };
  fieldMeta: {
    title: string;
    placeholder: string;
    description: string;
    readonly: boolean;
  };
}

// Hook that extracts all common field logic for form fields
export const useFormField = ({
  schema,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
}: UseFormFieldProps): FormFieldResult => {
  const uiConfig = schema["x-ui"] || {};

  const commonProps = useMemo(() => {
    return {
      value: value,
      onChange: (event: any) => {
        let extractedValue: any;

        if (event !== null && typeof event !== "object") {
          extractedValue = event;
        } else if (event?.target) {
          const { type, checked, value: targetValue } = event.target;

          switch (type) {
            case "checkbox":
              extractedValue = checked;
              break;
            case "number":
              if (targetValue === "" || targetValue === null) {
                extractedValue = null;
              } else {
                const numValue = Number(targetValue);
                extractedValue = isNaN(numValue) ? targetValue : numValue;
              }
              break;
            default:
              extractedValue = targetValue;
          }
        } else {
          extractedValue = event;
        }

        onChange(extractedValue);
      },
      onBlur,
      error: !!error,
      helperText: error || uiConfig.helperText || schema.description || "",
      disabled: disabled || uiConfig.readonly || false,
      required: false,
      fullWidth: true,
      margin: "normal" as const,
    };
  }, [schema, value, onChange, onBlur, error, disabled, uiConfig]);

  const componentProps = useMemo(() => {
    const props: { [key: string]: any } = {};

    switch (schema.type) {
      case "string":
        if (schema.format) {
          switch (schema.format) {
            case "email":
              props.type = "email";
              break;
            case "uri":
            case "url":
              props.type = "url";
              break;
            case "password":
              props.type = "password";
              break;
            default:
              props.type = "text";
          }
        } else {
          props.type = "text";
        }

        if (schema.pattern)
          props.inputProps = { ...props.inputProps, pattern: schema.pattern };
        if (schema.minLength)
          props.inputProps = {
            ...props.inputProps,
            minLength: schema.minLength,
          };
        if (schema.maxLength)
          props.inputProps = {
            ...props.inputProps,
            maxLength: schema.maxLength,
          };
        break;

      case "number":
      case "integer":
        props.type = "number";
        props.inputProps = {
          min: schema.minimum,
          max: schema.maximum,
          step: schema.type === "integer" ? 1 : "any",
        };
        break;

      case "array":
        break;

      case "boolean":
        break;
    }

    if (uiConfig.component === "textarea") {
      props.multiline = true;
      props.rows = uiConfig.rows || 4;
    }

    if (uiConfig.component === "slider") {
      props.min = (schema.minimum as number) || 0;
      props.max = (schema.maximum as number) || 1;
      props.step = uiConfig.step || (schema.type === "integer" ? 1 : 0.1);
      props.marks = uiConfig.marks || false;
      props.valueLabelDisplay = "auto";
    }

    return props;
  }, [schema, uiConfig]);

  const fieldMeta = useMemo(
    () => ({
      title: schema.title || "",
      placeholder: uiConfig.placeholder || "",
      description: schema.description || "",
      readonly: uiConfig.readonly || false,
    }),
    [schema, uiConfig]
  );

  return {
    commonProps,
    componentProps,
    fieldMeta,
  };
};

// Helper hook for boolean fields that need special handling
export const useBooleanField = (props: UseFormFieldProps) => {
  const result = useFormField(props);

  return {
    ...result,
    commonProps: {
      ...result.commonProps,
      checked: result.commonProps.value ?? false,
      onChange: (event: any) => {
        const checked = event?.target?.checked ?? event;
        props.onChange(checked);
      },
    },
  };
};

// Helper hook for enum/select fields
export const useEnumField = (props: UseFormFieldProps) => {
  const result = useFormField(props);
  const options = (props.schema.enum as string[]) || [];

  return {
    ...result,
    enumOptions: options.map((option) => ({
      value: option,
      label: option,
    })),
  };
};
