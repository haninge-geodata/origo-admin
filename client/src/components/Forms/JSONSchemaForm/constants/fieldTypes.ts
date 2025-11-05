// Field types that receive label and placeholder props
export const FIELD_TYPES_WITH_LABELS = [
  'text',
  'number',
  'email',
  'url',
  'password',
  'textarea',
  'date',
  'datetime',
  'time',
  'color',
  'file',
  'array-text',
  'api-select',
] as const;

// Field types that can display help tooltips with validation info
export const FIELD_TYPES_WITH_HELP_TOOLTIP = [
  'text',
  'number',
  'email',
  'url',
  'password',
  'textarea',
  'date',
  'datetime',
  'time',
  'color',
  'file',
  'array-text',
] as const;

// Default section name for fields without explicit section assignment
export const DEFAULT_SECTION_NAME = 'misc' as const;

