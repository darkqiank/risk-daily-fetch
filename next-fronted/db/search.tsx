import { MeiliSearch } from "meilisearch";

const meili_host: any = process.env.MEILI_HOST;
const meili_key: any = process.env.MEILI_KEY;

const searchClient = new MeiliSearch({
  host: meili_host,
  apiKey: meili_key,
});

export default searchClient;