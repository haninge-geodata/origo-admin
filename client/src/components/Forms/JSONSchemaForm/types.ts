import { ExtendedJSONSchema } from "@/types/jsonSchema";
import { FieldType } from "./fieldRegistry";

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

export interface JSONSchemaFormProps {
  schema: ExtendedJSONSchema;
  initialValues?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  loading?: boolean;
  submitText?: string;
  cancelText?: string;
}
