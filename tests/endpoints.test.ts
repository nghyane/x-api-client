import { test, expect, beforeAll } from 'bun:test';
import { getEndpoint, getEndpoints, updateEndpoints, invalidateCache } from '../src/core/endpoints';

beforeAll(async () => {
  await updateEndpoints({ force: false });
});

test('updateEndpoints creates cache', async () => {
  invalidateCache();
  const result = await updateEndpoints({ force: true });
  
  expect(result.success).toBe(true);
  expect(result.cache).toBeDefined();
  expect(result.cache.endpoints).toBeDefined();
  expect(Object.keys(result.cache.endpoints).length).toBeGreaterThan(0);
});

test('getEndpoint returns valid endpoint', async () => {
  const endpoint = await getEndpoint('CREATE_TWEET');
  
  expect(endpoint).toBeDefined();
  expect(endpoint.queryId).toBeTruthy();
  expect(endpoint.operationName).toBe('CreateTweet');
  expect(endpoint.url).toContain('graphql');
});

test('getEndpoint throws for invalid name', async () => {
  expect(async () => {
    await getEndpoint('INVALID_ENDPOINT' as any);
  }).toThrow();
});

test('getEndpoints returns all endpoints', async () => {
  const endpoints = await getEndpoints();
  
  expect(Object.keys(endpoints).length).toBeGreaterThan(0);
  expect(endpoints.CREATE_TWEET).toBeDefined();
  expect(endpoints.SEARCH_TIMELINE).toBeDefined();
  expect(endpoints.USER_BY_SCREEN_NAME).toBeDefined();
});

test('endpoints have correct structure', async () => {
  const endpoints = await getEndpoints();
  
  for (const endpoint of Object.values(endpoints)) {
    expect(endpoint).toHaveProperty('url');
    expect(endpoint).toHaveProperty('queryId');
    expect(endpoint).toHaveProperty('operationName');
    expect(typeof endpoint.url).toBe('string');
    expect(typeof endpoint.queryId).toBe('string');
    expect(typeof endpoint.operationName).toBe('string');
  }
});

test('updateEndpoints returns cache structure', async () => {
  const result = await updateEndpoints({ force: false });
  
  expect(result.success).toBe(true);
  expect(result.cache).toBeDefined();
  expect(result.cache.version).toBe('1.0');
  expect(result.cache.timestamp).toBeGreaterThan(0);
  expect(result.cache.endpoints).toBeDefined();
});

test('updateEndpoints respects force option', async () => {
  const result1 = await updateEndpoints({ force: false });
  const timestamp1 = result1.cache.timestamp;
  
  await Bun.sleep(100);
  
  const result2 = await updateEndpoints({ force: false });
  const timestamp2 = result2.cache.timestamp;
  
  expect(timestamp1).toBe(timestamp2);
});

test('cache contains valid endpoints', async () => {
  const result = await updateEndpoints({ force: false });
  const { endpoints } = result.cache;
  
  expect(Object.keys(endpoints).length).toBeGreaterThan(0);
  
  for (const data of Object.values(endpoints)) {
    expect(data.operationName).toBeTruthy();
    expect(data.queryId).toBeTruthy();
    expect(data.queryId.length).toBeGreaterThanOrEqual(10);
    expect(data.queryId.length).toBeLessThanOrEqual(50);
  }
});
