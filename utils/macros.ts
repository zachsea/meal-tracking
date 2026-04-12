/**
 * Round a macro value for display.
 * - kcal: no decimals (integer)
 * - protein/carbs/fiber/sugar: 1 decimal
 * - sodium: no decimals (integer)
 */
export function roundMacro(key: string, value: number): number {
  if (key === "kcal" || key === "sodium") {
    return Math.round(value);
  }
  return Math.round(value * 10) / 10;
}

/**
 * Format a macro value for display with appropriate decimal places.
 */
export function formatMacro(key: string, value: number): string {
  const rounded = roundMacro(key, value);
  if (key === "kcal" || key === "sodium") {
    return Math.round(rounded).toString();
  }
  return rounded.toFixed(1);
}
