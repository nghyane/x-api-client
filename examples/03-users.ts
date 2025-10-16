import { XApiClient } from "../src";

const client = new XApiClient(process.env.X_COOKIE!);

const user = await client.users.getUserByScreenName({
  screenName: "elonmusk",
});

console.log(`User: @${user.username}`);
console.log(`Followers: ${user.followersCount.toLocaleString()}`);

const tweets = await client.users.getUserTweets({
  userId: user.id,
  count: 5,
});

console.log(`Recent tweets: ${tweets.tweets.length}`);
tweets.tweets.forEach((t, i) => {
  console.log(`${i + 1}. ${t.text.substring(0, 60)}`);
});
