import { MeiliSearch } from "meilisearch";

const meili_host: any = process.env.MEILI_HOST;
const meili_key: any = process.env.MEILI_KEY;

const searchClient = new MeiliSearch({
  host: meili_host,
  apiKey: meili_key,
});

export default searchClient;

// 优化后的高亮处理函数
// const extractHighlightSnippets = (hit: any) => {
//   const rawContent = hit._formatted?.content || hit.content || "";

//   // 清理换行符和多余空格
//   const cleanContent = rawContent
//     .replace(/[\n\r]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();

//   // 匹配所有高亮片段
//   const highlightRegex = /__hl__(.*?)__\/hl__/g;
//   const highlights = [];
//   let match;

//   // 遍历所有高亮匹配项
//   while ((match = highlightRegex.exec(cleanContent)) !== null) {
//     const start = Math.max(0, match.index - 20); // 关键词前20字符
//     const end = match.index + match[0].length + 20; // 关键词后20字符

//     // 截取上下文片段
//     const snippet = cleanContent
//       .substring(start, end)
//       .replace(
//         /__hl__/g,
//         '<em class="bg-yellow-200 font-bold not-italic">',
//       ) // 转换高亮标签
//       .replace(/__\/hl__/g, "</em>");

//     highlights.push(snippet);
//     // 当收集到3个片段时立即停止
//     if (highlights.length >= 3) {
//       break;
//     }
//   }

//   return highlights.join(" ... ");
// };

// searchHits = searchResult.hits.map((item: any) => ({
//   id: item.id,
//   snippet: extractHighlightSnippets(item),
// }));

export const extractHighlightSnippets = (content: any) => {
  const cleanContent = content
    .replace(/[\n\r]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const highlightRegex = /__hl__(.*?)__\/hl__/g;
  const snippets = [];
  let match;

  // 遍历所有高亮匹配项，并记录每个片段及其打分（这里简单使用高亮文本长度作为得分）
  while ((match = highlightRegex.exec(cleanContent)) !== null) {
    const highlightedText = match[1];
    const score = highlightedText.length; // 可以用更复杂的评分逻辑
    const start = Math.max(0, match.index - 20); // 关键词前20字符
    const end = match.index + match[0].length + 20; // 关键词后20字符
    const snippet = cleanContent
      .substring(start, end)
      .replace(/__hl__/g, '<em class="bg-yellow-200 font-bold not-italic">')
      .replace(/__\/hl__/g, "</em>");

    snippets.push({ snippet, score });
  }

  // 按得分降序排序
  snippets.sort((a, b) => b.score - a.score);

  // 取出得分最高的三个片段，并使用" ... "连接
  const topSnippets = snippets.slice(0, 3).map((item) => item.snippet);

  return topSnippets.join(" ... ");
};
