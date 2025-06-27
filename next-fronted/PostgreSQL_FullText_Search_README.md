# PostgreSQL 全文搜索实现

本项目已将 MeiliSearch 替换为 PostgreSQL 的全文搜索功能，支持中文搜索。

## 功能特性

- ✅ 支持中文全文搜索
- ✅ 自动高亮搜索结果
- ✅ 支持前缀匹配
- ✅ 相关性排序
- ✅ 与现有过滤器兼容
- ✅ 性能优化（GIN 索引）

## 技术实现

### 1. 数据库索引

使用 PostgreSQL 的 GIN 索引进行全文搜索：

```sql
CREATE INDEX IF NOT EXISTS "idx_content_detail_fulltext_search" 
ON "content_detail" USING gin(
  to_tsvector('simple', 
    COALESCE(content, '') || ' ' || 
    COALESCE(url, '') || ' ' || 
    COALESCE(source, '')
  )
);
```

### 2. 搜索配置

- 使用 `simple` 配置支持中文搜索
- 搜索字段：`content`、`url`、`source`
- 支持前缀匹配（`:*`）
- 自动清理特殊字符

### 3. 核心函数

#### `fullTextSearch`
位置：`db/schema/content_detail.ts`

主要的全文搜索函数，支持：
- 查询字符串清理和处理
- 多字段搜索
- 高亮片段生成
- 相关性排序
- 分页支持

#### 搜索工具函数
位置：`db/search.tsx`

- `extractHighlightSnippets`: 处理高亮片段
- `cleanSearchQuery`: 清理查询字符串
- `buildTsQuery`: 构建 PostgreSQL tsquery
- `highlightText`: 高亮关键词
- `generateSearchSnippet`: 生成搜索摘要

## 使用方法

### API 端点

```typescript
// GET /api/detail?query=搜索词&page=1&pageSize=20
// 支持所有现有的过滤参数：date, sourceType, home, op, apt, eu, ioc
```

### 前端调用示例

```typescript
const searchResults = await fetch('/api/detail?query=网络安全&sourceType=blog&page=1&pageSize=10')
  .then(res => res.json());

// 返回格式
{
  data: [
    {
      id: 1,
      content: "原始内容...",
      snippet: "...网络<em class='bg-yellow-200 font-bold not-italic'>安全</em>威胁...", // 高亮片段
      // ... 其他字段
    }
  ],
  totalPages: 5,
  totalRecords: 50,
  pageNumber: 1,
  pageSize: 10,
  searchQuery: "网络安全"
}
```

## 性能优化

### 1. 数据库索引
- 使用 GIN 索引加速全文搜索
- 支持复合字段搜索

### 2. 查询优化
- 使用 `ts_rank` 进行相关性排序
- 限制搜索结果数量
- 支持查询缓存

### 3. 高亮优化
- 使用 `ts_headline` 自动生成高亮片段
- 限制片段数量和长度

## 安装和迁移

### 1. 运行数据库迁移

```bash
# 如果有数据库连接，运行迁移文件
psql -d your_database -f drizzle/0005_postgresql_fulltext_search.sql
```

### 2. 验证索引

```sql
-- 检查索引是否创建成功
\d+ content_detail

-- 测试搜索功能
SELECT * FROM content_detail 
WHERE to_tsvector('simple', COALESCE(content, '') || ' ' || COALESCE(url, '') || ' ' || COALESCE(source, '')) 
@@ to_tsquery('simple', '搜索词:*');
```

## 中文搜索支持

### 配置说明
- 使用 `simple` 配置避免词干提取影响中文搜索
- 支持中文字符：`\u4e00-\u9fa5`
- 自动处理标点符号和特殊字符

### 搜索示例
```
✅ 支持：网络安全、恶意软件、APT攻击
✅ 支持：network security（英文）
✅ 支持：混合搜索（中英文混合）
✅ 支持：前缀匹配（网络* 匹配 网络安全、网络攻击等）
```

## 故障排除

### 1. 搜索无结果
- 检查查询字符串是否正确清理
- 验证数据库索引是否存在
- 检查 `to_tsquery` 语法是否正确

### 2. 性能问题
- 确保 GIN 索引已创建
- 检查查询是否使用了索引（EXPLAIN ANALYZE）
- 考虑增加更多的查询限制条件

### 3. 高亮显示问题
- 检查 `ts_headline` 配置
- 验证前端 HTML 渲染
- 确保 CSS 样式正确加载

## 与 MeiliSearch 的差异

| 功能 | MeiliSearch | PostgreSQL |
|------|------------|------------|
| 中文支持 | ✅ 内置 | ✅ 通过 simple 配置 |
| 高亮显示 | ✅ 自动 | ✅ ts_headline |
| 相关性排序 | ✅ 自动 | ✅ ts_rank |
| 实时索引 | ✅ | ✅ 实时计算 |
| 外部依赖 | ❌ 需要独立服务 | ✅ 使用现有数据库 |
| 资源消耗 | ❌ 额外内存和存储 | ✅ 使用现有资源 |

## 后续优化建议

1. **预计算搜索向量**：如果数据量大，可以添加 `search_vector` 列存储预计算结果
2. **分词优化**：根据业务需求考虑使用专门的中文分词工具
3. **缓存机制**：对热门搜索词添加缓存层
4. **搜索分析**：记录搜索日志进行优化分析 