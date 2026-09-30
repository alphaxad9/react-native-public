// Simple ID generator for inspections
let counter = 0;

export function generateInspectionId(): string {
  counter += 1;
  const timestamp = Date.now();
  return `INS-${timestamp}-${counter}`;
}