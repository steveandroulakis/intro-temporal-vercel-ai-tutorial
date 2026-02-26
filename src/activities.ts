export async function greet(name: string): Promise<string> {
  return `Hello, ${name}!`;
}

// =============================================================================
// Exercise 3: Implement the getWeather activity
// =============================================================================
//
// TODO: Create an async function called `getWeather` that:
//   - Takes an input parameter: { location: string }
//   - Returns: { city: string, temperatureRange: string, conditions: string }
//   - For now, return hardcoded data (in production this would call a weather API)
//
// This is an Activity — it runs in normal Node.js, so it can make HTTP calls,
// access databases, or do any I/O. Temporal handles retries and timeouts.