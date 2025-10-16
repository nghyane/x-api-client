import { XApiClient } from "../src";

const client = new XApiClient(process.env.X_COOKIE!);

const timestamp = new Date().toISOString();
const result = await client.post(`Hello from X API Client! (${timestamp})`);

console.log("✅ Tweet posted successfully!");
console.log("Tweet ID:", result.id);
console.log("Tweet URL:", result.url);
console.log("Tweet Text:", result.text);
console.log("Author:", result.author.username);
