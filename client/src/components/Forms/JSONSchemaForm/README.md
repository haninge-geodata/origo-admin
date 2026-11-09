# JSON Schema Form System

A flexible, type-safe form system that automatically generates forms from JSON Schema definitions with full validation and custom UI controls.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     JSONSchemaForm.tsx                      │
│  Main orchestrator - handles form state, validation, submit │
└────────────────────────────┬────────────────────────────────┘
                             │                  
        ┌───────────────────┬┴─────────────┬──────────────┐
        │                   │              │              │
    ┌───▼────┐      ┌───────▼─────┐  ┌─────▼──┐    ┌──────▼──┐
    │ Utils  │      │ Components  │  │ Hooks  │    │Registry │
    └───┬────┘      └──────┬──────┘  └───┬────┘    └───┬─────┘
        │                  │             │             │
```

### Core Components

1. **JSONSchemaForm.tsx** - Main form component
2. **Field.tsx** - Individual field renderer with 11-step pipeline
3. **FormSection.tsx** - Collapsible/static section wrapper
4. **FieldGroup.tsx** - Handles inline/row/single field layouts

### Utilities

1. **sectionParser.ts** - Parses schema sections and assigns fields
2. **fieldGrouper.ts** - Groups fields by layout configuration
3. **formStatsCalculator.ts** - Calculates completion and validation stats
4. **fieldTypeDetection.ts** - Auto-detects field types from schema

### Hooks

1. **useFormField.ts** - Common field logic (text, number, etc.)
2. **useBooleanField.ts** - Boolean/switch field handling
3. **useEnumField.ts** - Select/dropdown field handling

### Registry

**fieldRegistry.ts** - Maps field types to MUI components with transform functions

## Data Flow

```
JSON Schema → Parse Sections → Group Fields → Render Components
                ↓                    ↓              ↓
            Validation          Layout Logic    Field Types
                ↓                    ↓              ↓
           Zod Schema         Grid Sizing      MUI Components
```

## Quick Start

### Basic Usage

```tsx
import { JSONSchemaForm } from '@/components/Forms/JSONSchemaForm';

const schema = {
  title: "User Form",
  type: "object",
  required: ["name", "email"],
  properties: {
    name: {
      type: "string",
      title: "Full Name",
      minLength: 2
    },
    email: {
      type: "string",
      title: "Email",
      format: "email"
    }
  },
  "x-ui": {
    sections: {
      main: {
        title: "User Information",
        order: 1
      }
    }
  }
};

function MyForm() {
  const handleSubmit = (data) => {
    console.log('Form data:', data);
  };

  return (
    <JSONSchemaForm
      schema={schema}
      initialValues={{}}
      onSubmit={handleSubmit}
    />
  );
}
```

## Custom UI Configuration

### Field-Level Configuration

Use the `x-ui` property in your schema to customize field rendering:

```json
{
  "name": {
    "type": "string",
    "title": "Name",
    "x-ui": {
      "component": "text",
      "section": "main",
      "placeholder": "Enter your name",
      "readOnly": false,
      "hide": false,
      "layout": {
        "priority": 1,
        "group": "personal-info",
        "width": "half"
      }
    }
  }
}
```

### Available x-ui Options

| Property | Type | Description |
|----------|------|-------------|
| `component` | string | Field type: text, textarea, checkbox, select, slider, etc. |
| `section` | string | Which section to place the field in |
| `placeholder` | string | Placeholder text for input fields |
| `readOnly` | boolean | Make field read-only |
| `hide` | boolean | Hide field from form (still in DOM) |
| `layout.priority` | number | Sort order within section |
| `layout.group` | string | Group related fields together |
| `layout.width` | string | Field width: full, half, third, quarter, auto |

### Section Configuration

```json
{
  "x-ui": {
    "sections": {
      "main": {
        "title": "Basic Information",
        "description": "Core user details",
        "order": 1,
        "collapsible": false
      },
      "advanced": {
        "title": "Advanced Settings",
        "order": 2,
        "collapsible": true,
        "defaultCollapsed": true
      }
    }
  }
}
```

## Field Types

### Supported Field Types

| Type | Component | Use Case |
|------|-----------|----------|
| `text` | TextField | Single-line text input |
| `textarea` | TextField (multiline) | Multi-line text |
| `number` | TextField (number) | Numeric input |
| `boolean` | Switch | True/false toggle |
| `enum` | Select | Dropdown from enum values |
| `multi-select` | Select (multiple) | Multiple choices |
| `slider` | Slider | Range selection |
| `date` | TextField (date) | Date picker |
| `color` | TextField (color) | Color picker |
| `json-editor` | JSONEditor | JSON object editing |
| `key-value` | KeyValuePairEditor | Key-value pairs |
| `api-select` | ApiSelect | Dynamic options from API |

### Auto-Detection

The system auto-detects field types from JSON Schema:

- `type: "string"` + `format: "email"` → Email field
- `type: "number"` + `minimum/maximum` → Number field or slider
- `type: "boolean"` → Switch
- `type: "string"` + `enum: [...]` → Select dropdown
- `type: "object"` → JSON editor

## Field Grouping

### Group Types

**Inline Groups** - Checkboxes in a horizontal row
```json
{
  "notifications": {
    "type": "boolean",
    "x-ui": {
      "layout": { "group": "settings" }
    }
  },
  "newsletter": {
    "type": "boolean",
    "x-ui": {
      "layout": { "group": "settings" }
    }
  }
}
```

**Row Groups** - Multiple fields in styled columns
```json
{
  "firstName": {
    "type": "string",
    "x-ui": {
      "layout": { "group": "name", "width": "half" }
    }
  },
  "lastName": {
    "type": "string",
    "x-ui": {
      "layout": { "group": "name", "width": "half" }
    }
  }
}
```

## Field Rendering Pipeline

The `Field.tsx` component follows an 11-step rendering pipeline:

1. **Determine field type** - Explicit or auto-detect
2. **Validate schema** - Check type compatibility
3. **Get appropriate hook** - useFormField, useBooleanField, useEnumField
4. **Handle render prop** - Custom rendering if provided
5. **Get component config** - Look up in registry
6. **Transform props** - Registry customization
7. **Handle special cases** - Enum options, multi-select, labels
8. **Render component** - Create MUI component
9. **Add help tooltip** - For fields with constraints
10. **Wrap in custom wrapper** - Boolean/enum wrappers
11. **Return final component**

## Validation

Validation is handled automatically via JSON Schema → Zod conversion:

```json
{
  "email": {
    "type": "string",
    "format": "email",
    "minLength": 5,
    "maxLength": 100
  }
}
```

This automatically creates:
- Email format validation
- Minimum length check
- Maximum length check
- Real-time error messages

## Adding a New Field Type

1. **Create component** in `fieldRegistry.ts`:

```typescript
export const FIELD_REGISTRY: Record<FieldType, FieldConfig> = {
  // ... existing fields ...
  'my-custom-field': {
    component: MyCustomComponent,
    transformProps: (props, schema) => ({
      value: props.value,
      onChange: props.onChange,
      // ... custom props ...
    })
  }
};
```

2. **Add to FieldType** union in `fieldRegistry.ts`

3. **Update detection logic** in `fieldTypeDetection.ts` (if auto-detecting)

4. **Use in schema**:

```json
{
  "myField": {
    "type": "string",
    "x-ui": {
      "component": "my-custom-field"
    }
  }
}
```

## Common Patterns

### Read-Only Field

```json
{
  "id": {
    "type": "string",
    "title": "ID",
    "x-ui": {
      "readOnly": true
    }
  }
}
```

### Hidden Field (Still Submits)

```json
{
  "internalFlag": {
    "type": "boolean",
    "x-ui": {
      "hide": true
    }
  }
}
```

### Conditional Required

```json
{
  "phone": {
    "type": "string",
    "x-validation": {
      "requiredIf": {
        "field": "contactMethod",
        "value": "phone"
      }
    }
  }
}
```

### API-Driven Select

```json
{
  "category": {
    "type": "string",
    "x-ui": {
      "component": "api-select"
    },
    "x-datasource": {
      "type": "api",
      "endpoint": "categories",
      "valueField": "id",
      "labelField": "name",
      "cache": true
    }
  }
}
```

## Form State Management

The form uses `react-hook-form` for state management:

- **Real-time validation** - Validates on change
- **Dirty tracking** - Knows when form has unsaved changes
- **Error handling** - Per-field error messages
- **Completion tracking** - Progress percentage

## Styling & Theming

Forms use MUI (Material-UI) components and respect the theme:

- Customize via MUI theme provider
- All components support `sx` prop
- Section styles can be customized in FormSection.tsx
- Field group styles in FieldGroup.tsx

## Performance

- **Memoization** - Heavy computations memoized
- **Lazy rendering** - Collapsible sections reduce initial render
- **Validation throttling** - Via react-hook-form
- **Small bundle** - Tree-shakeable components

## Testing

```typescript
import { render, screen } from '@testing-library/react';
import { JSONSchemaForm } from './JSONSchemaForm';

test('renders form fields from schema', () => {
  const schema = {
    properties: {
      name: { type: 'string', title: 'Name' }
    }
  };
  
  render(<JSONSchemaForm schema={schema} onSubmit={jest.fn()} />);
  
  expect(screen.getByLabelText('Name')).toBeInTheDocument();
});
```

## Troubleshooting

### Form Not Rendering

- Check `schema.properties` exists
- Verify `x-ui.sections` is defined
- Check browser console for errors

### Field Not Showing

- Check field has `x-ui.section` defined
- Verify section exists in `x-ui.sections`
- Check if `x-ui.hide` is set to true

### Validation Not Working

- Ensure field type matches JSON Schema type
- Check Zod conversion in browser console
- Verify required fields in `schema.required`

### Custom Component Not Rendering

- Verify component registered in fieldRegistry
- Check FieldType union includes new type
- Ensure x-ui.component matches registry key

## File Structure

```
JSONSchemaForm/
├── README.md                          (this file)
├── JSONSchemaForm.tsx                 (main form component)
├── Field.tsx                          (field renderer)
├── types.ts                           (TypeScript interfaces)
├── fieldRegistry.ts                   (field type → component mapping)
│
├── components/
│   ├── FormSection.tsx                (section wrapper)
│   ├── FieldGroup.tsx                 (field group layout)
│   ├── ApiSelect.tsx                  (API-driven select)
│   └── FieldHelpTooltip.tsx           (help icon with info)
│
├── hooks/
│   └── useFormField.ts                (field state management)
│
└── utils/
    ├── sectionParser.ts               (section parsing logic)
    ├── fieldGrouper.ts                (field grouping logic)
    ├── formStatsCalculator.ts         (completion stats)
    └── fieldTypeDetection.ts          (auto field type detection)
```

## Further Reading

- [JSON Schema Specification](https://json-schema.org/)
- [react-hook-form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Material-UI Components](https://mui.com/)

## Contributing

When adding features:

1. Keep utilities pure (no side effects)
2. Add TypeScript types for new props
3. Update this README with examples
4. Add comments explaining "why" not "what"
5. Test with different schema configurations

