import React, { useEffect, useState } from 'react';
import { TextField, Autocomplete, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ExtendedJSONSchema } from '@/types/jsonSchema';

interface ApiDataSource {
  type: 'api';
  endpoint?: string;
  url?: string;
  valueField: string;
  labelField: string;
  cache?: boolean;
}

interface ApiSelectProps {
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  schema: ExtendedJSONSchema;
  label?: string;
  placeholder?: string;
}

interface ApiSelectOption {
  [key: string]: any;
}

export const ApiSelect: React.FC<ApiSelectProps> = ({
  value,
  onChange,
  onBlur,
  error = false,
  helperText = '',
  disabled = false,
  fullWidth = true,
  schema,
  label,
  placeholder,
}) => {
  const [selectedValue, setSelectedValue] = useState<ApiSelectOption | null>(null);

  // Extract datasource configuration from schema
  const datasource = schema['x-datasource'] as ApiDataSource;

  if (!datasource || datasource.type !== 'api') {
    // Fallback to regular text field if no datasource configuration
    return (
      <TextField
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        error={error}
        helperText={helperText || 'No datasource configuration found'}
        disabled={disabled}
        fullWidth={fullWidth}
        label={label}
        placeholder={placeholder}
        margin="normal"
      />
    );
  }

  const { endpoint, url, valueField, labelField, cache = true } = datasource;

  // Generic function to construct API URL through proxy
  const constructApiUrl = async (endpoint: string): Promise<string> => {
    // Get BASE_URL from environment (same pattern as BaseApiService)
    const baseUrlResponse = await fetch('/api/config?name=BASE_URL');
    const baseUrl = await baseUrlResponse.text().then(url => url.trim());

    // Use same URL construction as RestClient
    const apiUrl = new URL(endpoint, baseUrl).toString();

    // Build proxy URL with encoded backend URL (same as RestClient)
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(apiUrl)}`;
    return proxyUrl;
  };

  // Fetch data from API
  const {
    data: options = [],
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ['api-select', endpoint || url],
    queryFn: async () => {
      let apiUrl: string;

      // If endpoint is specified, construct proxy URL dynamically
      if (endpoint) {
        apiUrl = await constructApiUrl(endpoint);
      } else if (url) {
        // Fallback to direct URL (for backward compatibility)
        apiUrl = url;
      } else {
        throw new Error('No valid data source specified - need either endpoint or url');
      }

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch data from ${apiUrl}: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!(endpoint || url),
    staleTime: cache ? 5 * 60 * 1000 : 0, // 5 minutes if cache enabled
    gcTime: cache ? 10 * 60 * 1000 : 0, // 10 minutes if cache enabled
  });

  // Update selected value when options are loaded or value changes
  useEffect(() => {
    if (!isLoading && options.length > 0 && value !== undefined && value !== null) {
      const foundOption = options.find((option: ApiSelectOption) =>
        option[valueField] === value ||
        (typeof value === 'object' && value[valueField] === option[valueField])
      );

      if (foundOption) {
        setSelectedValue(foundOption);
      } else {
        // If value doesn't match any option, clear selection
        setSelectedValue(null);
      }
    } else if (value === undefined || value === null) {
      setSelectedValue(null);
    }
  }, [value, options, isLoading, valueField]);

  const handleChange = (event: any, newValue: ApiSelectOption | null) => {
    setSelectedValue(newValue);

    if (newValue) {
      // Return the value field content, or the full object if valueField not found
      const outputValue = newValue[valueField] !== undefined ? newValue[valueField] : newValue;
      onChange(outputValue);
    } else {
      onChange(null);
    }
  };

  const getOptionLabel = (option: ApiSelectOption | string) => {
    if (typeof option === 'string') return option;
    return option[labelField] || option[valueField] || 'Unknown';
  };

  const isOptionEqualToValue = (option: ApiSelectOption, value: ApiSelectOption) => {
    if (!option || !value) return false;
    return option[valueField] === value[valueField];
  };

  // Show loading state
  if (isLoading) {
    return (
      <TextField
        value=""
        disabled
        fullWidth={fullWidth}
        label={label}
        placeholder="Loading options..."
        margin="normal"
        InputProps={{
          endAdornment: <CircularProgress size={20} />,
        }}
      />
    );
  }

  // Show error state
  if (fetchError) {
    return (
      <TextField
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        error={true}
        helperText={`Failed to load options: ${fetchError.message}`}
        disabled={disabled}
        fullWidth={fullWidth}
        label={label}
        placeholder={placeholder}
        margin="normal"
      />
    );
  }

  return (
    <Autocomplete
      value={selectedValue}
      onChange={handleChange}
      options={options}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      disabled={disabled}
      fullWidth={fullWidth}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          onBlur={onBlur}
          margin="normal"
        />
      )}
      sx={{ mt: 2, mb: 1 }}
    />
  );
};

export default ApiSelect;