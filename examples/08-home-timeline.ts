import { XApiClient } from "../src";

const client = new XApiClient(process.env.X_COOKIE!);

console.log("🏠 Fetching home timeline...\n");

// Fetch first page
const response = await client.tweets.getHomeTimeline({ count: 10 });

// Parse the response
const instructions = response.data?.home?.home_timeline_urt?.instructions || [];

let tweetCount = 0;
let cursor: string | undefined;

for (const instruction of instructions) {
  if (instruction.type === "TimelineAddEntries" && instruction.entries) {
    for (const entry of instruction.entries) {
      if (entry.content.entryType === "TimelineTimelineItem") {
        const tweetResult = entry.content.itemContent?.tweet_results?.result;

        if (tweetResult && tweetResult.legacy && tweetResult.rest_id) {
          tweetCount++;
          console.log(`📝 Tweet #${tweetCount}`);
          console.log("─".repeat(50));
          console.log("ID:", tweetResult.rest_id);
          console.log("Author:", tweetResult.core?.user_results.result.core.screen_name);
          const text = tweetResult.legacy.full_text || "";
          console.log("Text:", text.slice(0, 100) + (text.length > 100 ? "..." : ""));
          console.log("Likes:", tweetResult.legacy.favorite_count);
          console.log("Retweets:", tweetResult.legacy.retweet_count);
          console.log("─".repeat(50));
          console.log();
        }
      } else if (entry.content.entryType === "TimelineTimelineCursor") {
        // Handle cursor for pagination
        if (entry.content.cursorType === "Bottom") {
          cursor = entry.content.value;
        }
      }
    }
  }
}

console.log(`\n✅ Found ${tweetCount} tweets in your timeline`);

if (cursor) {
  console.log(`\n💡 Next page cursor: ${cursor.slice(0, 50)}...`);
  console.log("\nTo fetch next page, use:");
  console.log(`await client.tweets.getHomeTimeline({ count: 10, cursor: "${cursor.slice(0, 30)}..." });`);
}

// Example: Pagination
// const nextPage = await client.tweets.getHomeTimeline({ count: 10, cursor });
// console.log("Next page fetched!");

// Example: Mark tweets as seen to exclude them
// const seenIds = ["1978432465216639081", "1978432465216639082"];
// const filtered = await client.tweets.getHomeTimeline({ count: 10, seenTweetIds: seenIds });
