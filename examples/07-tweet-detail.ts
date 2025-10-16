import { XApiClient } from "../src";

const client = new XApiClient(process.env.X_COOKIE!);

// Tweet ID to get details for
const tweetId = "1978080501891006713";

console.log("📋 Fetching tweet details...\n");

const response = await client.tweets.getTweetDetail({ tweetId });

// Parse the response
const instructions = response.data?.threaded_conversation_with_injections_v2?.instructions || [];

for (const instruction of instructions) {
  if (instruction.type === "TimelineAddEntries" && instruction.entries) {
    for (const entry of instruction.entries) {
      if (entry.content.entryType === "TimelineTimelineItem") {
        const tweetResult = entry.content.itemContent?.tweet_results?.result;

        if (tweetResult) {
          console.log("✅ Tweet Details:");
          console.log("─".repeat(50));
          console.log("Tweet ID:", tweetResult.rest_id);
          console.log("Author:", tweetResult.core?.user_results.result.core.screen_name);
          console.log("Author Name:", tweetResult.core?.user_results.result.core.name);
          console.log("\nText:", tweetResult.legacy.full_text);
          console.log("\nEngagement:");
          console.log("  Likes:", tweetResult.legacy.favorite_count);
          console.log("  Retweets:", tweetResult.legacy.retweet_count);
          console.log("  Replies:", tweetResult.legacy.reply_count);
          console.log("  Quotes:", tweetResult.legacy.quote_count);
          console.log("  Views:", tweetResult.views?.count || "N/A");
          console.log("\nCreated:", tweetResult.legacy.created_at);
          console.log("─".repeat(50));
        }
      } else if (entry.content.entryType === "TimelineTimelineCursor") {
        // Handle cursor for pagination
        if (entry.content.cursorType === "Bottom") {
          console.log("\n💡 Cursor for more replies:", entry.content.value);
        }
      }
    }
  }
}

// You can also access the raw response
console.log("\n📦 Raw response available at: response.data");
