export type Column = {
  field: string;
  headerName: string;
  hide?: boolean;
  defaultValue?: string | number | boolean | null;
  fallbackField?: string;
  inputType?: string;
  readOnly?: boolean;
  placeholder?: string;
  validation?: {
    required: boolean;
    type: string;
    message: string;
  };
};

export type DataRow = {
  id: string;
  [key: string]: any;
};

export type TableData = {
  columns: Column[];
  rows: DataRow[];
};
