import { XApiClient } from "../src";

const client = new XApiClient(process.env.X_COOKIE!);

// Tweet to quote
const tweetId = "1825923537833701547";
const authorUsername = "mangaraw_onl"; // The username of the tweet author

// Basic quote (text only)
console.log("📝 Posting quote tweet...");
const timestamp = new Date().toISOString();
const result = await client.quote(
  tweetId,
  authorUsername,
  `This is really interesting! 🧵 (${timestamp})`
);

console.log("\n✅ Quote tweet posted successfully!");
console.log("Quote ID:", result.id);
console.log("Quote URL:", result.url);
console.log("Quote Text:", result.text);
console.log("Author:", result.author.username);
console.log("Metrics:", result.metrics);

// Quote with image (uncomment to test)
// const withImage = await client.quote(
//   tweetId,
//   authorUsername,
//   "Here's my take on this with some context:",
//   ["./examples/sample-image.png"]
// );
// console.log("Quote with image:", withImage.url);

// Quote with multiple images (uncomment to test)
// const withImages = await client.quote(
//   tweetId,
//   authorUsername,
//   "Check out these related examples:",
//   ["./img1.png", "./img2.png"]
// );
// console.log("Quote with images:", withImages.url);
