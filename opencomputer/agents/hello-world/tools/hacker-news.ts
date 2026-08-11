import {
  defineConnection,
  defineTool,
  secretHeader,
  useSecret,
} from "@opencomputer/agent";

export const hackerNews = defineConnection({
  id: "hacker-news",
  origin: "https://hacker-news.firebaseio.com",
  methods: ["GET"],
  pathPrefix: "/v0/",
  headers: {
    "X-API-Key": secretHeader(useSecret("HN_TEST_KEY")),
  },
});

export const latestStories = defineTool({
  name: "latest_hacker_news_stories",
  description: "Fetch the current Hacker News top-story IDs",
  async run() {
    const response = await hackerNews.fetch("/v0/topstories.json");
    const stories = (await response.json()) as number[];

    return {
      ok: response.ok,
      count: stories.length,
      firstFive: stories.slice(0, 5),
    };
  },
});
