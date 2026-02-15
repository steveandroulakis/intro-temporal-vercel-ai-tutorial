import { proxyActivities, sleep } from '@temporalio/workflow';
import type * as activities from './activities';

const { greet, goodbye } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

// Exercise 1 solution: with durable timer + goodbye activity
export async function helloWorld(name: string): Promise<string> {
  const greeting = await greet(name);
  console.log(greeting);

  await sleep('10s');

  const farewell = await goodbye(name);
  return `${greeting} ... ${farewell}`;
}
