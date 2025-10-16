import { XApiClient } from "../src";

const client = new XApiClient(process.env.X_COOKIE!);

const page1 = await client.search.searchTweets({
  query: "bitcoin",
  count: 10,
  product: "Latest",
});

console.log(`Found ${page1.tweets.length} tweets`);
page1.tweets.forEach((t, i) => {
  console.log(`${i + 1}. @${t.authorUsername}: ${t.text.substring(0, 60)}`);
});

if (page1.cursor) {
  const page2 = await client.search.searchTweets({
    query: "bitcoin",
    count: 10,
    product: "Latest",
    cursor: page1.cursor,
  });
  console.log(`Page 2: ${page2.tweets.length} tweets`);
}
