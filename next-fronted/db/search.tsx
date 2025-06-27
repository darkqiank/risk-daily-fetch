// PostgreSQL 全文搜索工具函数
// 替代原来的 MeiliSearch 功能

// 用于处理PostgreSQL ts_headline生成的高亮片段
export const extractHighlightSnippets = (content: any) => {
  if (!content) return '';
  
  // PostgreSQL的ts_headline使用<b>和</b>作为默认高亮标签
  // 将其替换为我们需要的样式
  return content
    .replace(/<b>/g, '<em class="bg-yellow-200 font-bold not-italic">')
    .replace(/<\/b>/g, '</em>');
};

// 清理查询字符串，支持中文
export const cleanSearchQuery = (query: string): string => {
  return query
    .trim()
    .replace(/[^\w\s\u4e00-\u9fa5]/g, ' ') // 保留中文字符
    .replace(/\s+/g, ' ');
};

// 构建PostgreSQL tsquery
export const buildTsQuery = (query: string): string => {
  const cleanQuery = cleanSearchQuery(query);
  
  if (!cleanQuery) return '';
  
  return cleanQuery
    .split(' ')
    .filter(term => term.length > 0)
    .map(term => term + ':*') // 添加前缀匹配
    .join(' & ');
};

// 高亮文本中的关键词（用于前端显示）
export const highlightText = (text: string, keywords: string[]): string => {
  if (!text || !keywords.length) return text;
  
  let highlightedText = text;
  
  keywords.forEach(keyword => {
    if (keyword.trim()) {
      const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<em class="bg-yellow-200 font-bold not-italic">$1</em>');
    }
  });
  
  return highlightedText;
};

// 生成搜索摘要片段
export const generateSearchSnippet = (content: string, query: string, maxLength: number = 200): string => {
  if (!content || !query) return '';
  
  const keywords = cleanSearchQuery(query).split(' ').filter(Boolean);
  
  // 查找第一个关键词的位置
  let firstMatchIndex = -1;
  for (const keyword of keywords) {
    const index = content.toLowerCase().indexOf(keyword.toLowerCase());
    if (index !== -1) {
      firstMatchIndex = index;
      break;
    }
  }
  
  if (firstMatchIndex === -1) {
    // 没有找到关键词，返回开头部分
    return content.substring(0, maxLength) + '...';
  }
  
  // 以第一个关键词为中心，提取前后文本
  const start = Math.max(0, firstMatchIndex - 50);
  const end = Math.min(content.length, firstMatchIndex + maxLength - 50);
  
  let snippet = content.substring(start, end);
  
  // 添加省略号
  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';

  // 高亮关键词
  return highlightText(snippet, keywords);
};

export default {
  extractHighlightSnippets,
  cleanSearchQuery,
  buildTsQuery,
  highlightText,
  generateSearchSnippet,
};
