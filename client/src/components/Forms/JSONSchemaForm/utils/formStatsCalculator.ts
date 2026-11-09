export interface FormStats {
  completion: number; // Percentage 0-100 based on required fields
  totalFields: number; // Total number of fields in schema
  filledFields: number; // Number of fields with values
  errorCount: number; // Number of validation errors
  requiredFields: number; // Total required fields
  filledRequired: number; // Filled required fields
}

// Check if a field value should count as "filled"
function isFieldFilled(value: any): boolean {
  return value !== undefined && value !== null && value !== "";
}

// Calculate form completion stats based on REQUIRED fields only
export function calculateFormStats(
  schemaProperties: Record<string, any>,
  formValues: Record<string, any>,
  errors: Record<string, any>,
  requiredFieldNames: string[] = []
): FormStats {
  const errorCount = Object.keys(errors).length;
  const totalFields = Object.keys(schemaProperties).length;

  // Get count of required fields
  const requiredFields = requiredFieldNames.length;

  // Count how many required fields are filled
  const filledRequired = requiredFieldNames.filter((fieldName) => {
    const value = formValues[fieldName];
    return isFieldFilled(value);
  }).length;

  // Count all filled fields (for display purposes)
  const filledFields = Object.keys(schemaProperties).filter((field) => {
    const value = formValues[field];
    return isFieldFilled(value);
  }).length;

  // Calculate completion based on REQUIRED fields only
  const completion =
    requiredFields > 0
      ? Math.round((filledRequired / requiredFields) * 100)
      : 100; // If no required fields, form is "complete"

  return {
    completion,
    totalFields,
    filledFields,
    errorCount,
    requiredFields,
    filledRequired,
  };
}
