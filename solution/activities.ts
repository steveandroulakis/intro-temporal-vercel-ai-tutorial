export async function greet(name: string): Promise<string> {
  return `Hello, ${name}!`;
}

// Exercise 1 modification: goodbye activity
export async function goodbye(name: string): Promise<string> {
  return `Goodbye, ${name}!`;
}

// Exercise 3: getWeather activity
export async function getWeather(input: {
  location: string;
}): Promise<{ city: string; temperatureRange: string; conditions: string }> {
  return {
    city: input.location,
    temperatureRange: '14-20C',
    conditions: 'Sunny with wind.',
  };
}
