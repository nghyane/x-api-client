import { XApiClient } from "../src";

const client = new XApiClient(process.env.X_COOKIE!);

// Tweet ID to reply to
const tweetId = "1825923537833701547";

// Basic reply (text only)
console.log("📝 Posting reply...");
const timestamp = new Date().toISOString();
const result = await client.reply(tweetId, `Great post! 👍 (${timestamp})`);

console.log("\n✅ Reply posted successfully!");
console.log("Reply ID:", result.id);
console.log("Reply URL:", result.url);
console.log("Reply Text:", result.text);
console.log("Author:", result.author.username);
console.log("Metrics:", result.metrics);

// Reply with image (uncomment to test)
// const withImage = await client.reply(tweetId, "Here's my thoughts on this:", [
//   "./examples/sample-image.png",
// ]);
// console.log("Reply with image:", withImage.url);

// Reply with multiple images (uncomment to test)
// const withImages = await client.reply(tweetId, "Check out these screenshots:", [
//   "./img1.png",
//   "./img2.png",
//   "./img3.png",
// ]);
// console.log("Reply with images:", withImages.url);
