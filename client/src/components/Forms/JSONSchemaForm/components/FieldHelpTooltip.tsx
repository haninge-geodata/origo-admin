import React from 'react';
import {
  Tooltip,
  IconButton,
  Box,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import { HelpOutline as HelpIcon } from '@mui/icons-material';
import { ExtendedJSONSchema } from '@/types/jsonSchema';

interface FieldHelpTooltipProps {
  schema: ExtendedJSONSchema;
  fieldName: string;
}

export const hasHelpInfo = (schema: ExtendedJSONSchema): boolean => {
  return !!(
    schema.description ||
    schema.examples ||
    schema.pattern ||
    schema.minimum !== undefined ||
    schema.maximum !== undefined ||
    schema.minLength !== undefined ||
    schema.maxLength !== undefined
  );
};

export const FieldHelpTooltip: React.FC<FieldHelpTooltipProps> = ({
  schema,
  fieldName,
}) => {
  if (!hasHelpInfo(schema)) return null;

  const chipSx = { fontSize: '0.7rem', height: 20 };
  const hasValidationRules = schema.pattern || schema.minimum !== undefined ||
                             schema.maximum !== undefined || schema.minLength !== undefined ||
                             schema.maxLength !== undefined;

  const tooltipContent = (
    <Box sx={{ maxWidth: 320 }}>
      {/* Description */}
      {schema.description && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          {schema.description}
        </Typography>
      )}

      {/* Validation Rules */}
      {hasValidationRules && (
        <>
          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Validation Rules:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {schema.minLength !== undefined && (
              <Chip label={`Min: ${schema.minLength} chars`} size="small" variant="outlined" sx={chipSx} />
            )}
            {schema.maxLength !== undefined && (
              <Chip label={`Max: ${schema.maxLength} chars`} size="small" variant="outlined" sx={chipSx} />
            )}
            {schema.minimum !== undefined && (
              <Chip label={`Min: ${schema.minimum}`} size="small" variant="outlined" sx={chipSx} />
            )}
            {schema.maximum !== undefined && (
              <Chip label={`Max: ${schema.maximum}`} size="small" variant="outlined" sx={chipSx} />
            )}
            {schema.pattern && (
              <Chip label={`Pattern: ${schema.pattern}`} size="small" variant="outlined" sx={chipSx} />
            )}
          </Box>
        </>
      )}

      {/* Examples */}
      {schema.examples && schema.examples.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Examples:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {schema.examples.slice(0, 3).map((example, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  bgcolor: 'grey.100',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                }}
              >
                {String(example)}
              </Typography>
            ))}
            {schema.examples.length > 3 && (
              <Typography variant="caption" color="text.secondary">
                +{schema.examples.length - 3} more examples
              </Typography>
            )}
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <Tooltip
      title={tooltipContent}
      placement="top-start"
      arrow
      enterDelay={300}
      leaveDelay={200}
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: 'background.paper',
            color: 'text.primary',
            border: 1,
            borderColor: 'divider',
            boxShadow: 3,
            borderRadius: 2,
            maxWidth: 'none',
          },
        },
        arrow: {
          sx: {
            color: 'background.paper',
            '&::before': {
              border: 1,
              borderColor: 'divider',
            },
          },
        },
      }}
    >
      <IconButton
        size="small"
        sx={{
          ml: 1,
          p: 0.5,
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main',
            bgcolor: 'primary.50',
          },
        }}
      >
        <HelpIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Tooltip>
  );
};