import { XApiClient } from "../src";

const client = new XApiClient(process.env.X_COOKIE!);
const tweetId = "1825923537833701547";

await client.engagement.like(tweetId);
console.log("Liked");

await client.engagement.unlike(tweetId);
console.log("Unliked");

const retweetId = await client.engagement.retweet(tweetId);
console.log("Retweeted:", retweetId);

await client.engagement.unretweet(tweetId);
console.log("Unretweeted");
