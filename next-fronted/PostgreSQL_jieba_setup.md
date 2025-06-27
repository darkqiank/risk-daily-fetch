# PostgreSQL pg_jieba 安装配置指南

## 方案1：使用 pg_jieba（推荐）

### 安装 pg_jieba

#### Ubuntu/Debian
```bash
# 安装依赖
sudo apt-get update
sudo apt-get install postgresql-server-dev-all build-essential cmake

# 克隆 pg_jieba 仓库
git clone https://github.com/jaiminpan/pg_jieba.git
cd pg_jieba

# 编译安装
mkdir build
cd build
cmake ..
make
sudo make install
```

#### MacOS (使用 Homebrew)
```bash
# 安装依赖
brew install postgresql cmake

# 克隆并编译
git clone https://github.com/jaiminpan/pg_jieba.git
cd pg_jieba
mkdir build
cd build
cmake ..
make
sudo make install
```

#### Docker 环境
```dockerfile
FROM postgres:15

# 安装编译工具和依赖
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    postgresql-server-dev-all

# 安装 pg_jieba
RUN git clone https://github.com/jaiminpan/pg_jieba.git /tmp/pg_jieba
WORKDIR /tmp/pg_jieba
RUN mkdir build && cd build && cmake .. && make && make install

# 清理
RUN rm -rf /tmp/pg_jieba
RUN apt-get remove -y build-essential cmake git && apt-get autoremove -y
```

### 配置 pg_jieba

```sql
-- 连接到您的数据库
\c your_database_name

-- 创建 pg_jieba 扩展
CREATE EXTENSION IF NOT EXISTS pg_jieba;

-- 创建中文分词配置
CREATE TEXT SEARCH CONFIGURATION jiebacfg (COPY = simple);
ALTER TEXT SEARCH CONFIGURATION jiebacfg ALTER MAPPING FOR word WITH jieba_query;

-- 测试配置
SELECT to_tsvector('jiebacfg', '这是一个中文分词测试，包含Orange.fr域名');
SELECT to_tsquery('jiebacfg', 'Orange.fr:*');
```

## 方案2：备用方案（如果无法安装 pg_jieba）

如果环境不支持 pg_jieba，可以使用改进的 'english' 配置：

```sql
-- 创建自定义配置
CREATE TEXT SEARCH CONFIGURATION chinese_english (COPY = english);

-- 修改配置以更好地处理特殊字符
ALTER TEXT SEARCH CONFIGURATION chinese_english
  ALTER MAPPING FOR hword, hword_part, word
  WITH simple;
```

然后修改代码中的配置：

```typescript
// 在 db/schema/content_detail.ts 中替换 'jiebacfg' 为 'chinese_english'
// 如果 pg_jieba 不可用
const CONFIG = 'chinese_english'; // 或者 'english'
```

## 方案3：简单字符串匹配（最后备选）

如果上述方案都不适用，可以使用 ILIKE 模式匹配：

```typescript
// 在 fullTextSearch 函数中添加备用搜索逻辑
const fallbackSearchConditions = [
  sql`(
    ${contentDetail.content} ILIKE ${'%' + cleanQuery + '%'} OR
    ${contentDetail.url} ILIKE ${'%' + cleanQuery + '%'} OR  
    ${contentDetail.source} ILIKE ${'%' + cleanQuery + '%'}
  )`
];
```

## 验证安装

### 测试 pg_jieba 是否正常工作

```sql
-- 测试中文分词
SELECT to_tsvector('jiebacfg', '网络安全威胁情报分析');

-- 测试特殊字符处理
SELECT to_tsvector('jiebacfg', 'Orange.fr 网站安全漏洞');

-- 测试搜索
SELECT to_tsquery('jiebacfg', 'Orange.fr:*');
SELECT to_tsquery('jiebacfg', '网络:* & 安全:*');
```

### 检查索引性能

```sql
-- 检查查询计划
EXPLAIN ANALYZE
SELECT * FROM content_detail 
WHERE to_tsvector('jiebacfg', COALESCE(content, '') || ' ' || COALESCE(url, '') || ' ' || COALESCE(source, '')) 
@@ to_tsquery('jiebacfg', 'Orange.fr:*');
```

## 常见问题

### 1. Orange.fr 搜索不到的问题

**原因**：
- `simple` 配置会忽略点号（.）
- 域名被分解为 "Orange" 和 "fr"

**解决**：
- pg_jieba 会保留域名结构
- 或者使用 ILIKE 模式匹配作为补充

### 2. 中英文混合搜索问题

**原因**：
- 不同配置对中英文处理方式不同

**解决**：
- pg_jieba 对中英文混合支持更好
- 统一使用一种配置避免冲突

### 3. 性能问题

**原因**：
- GIN 索引可能未正确创建
- 查询条件过于复杂

**解决**：
```sql
-- 重建索引
DROP INDEX IF EXISTS idx_content_detail_fulltext_search;
CREATE INDEX idx_content_detail_fulltext_search 
ON content_detail USING gin(
  to_tsvector('jiebacfg', COALESCE(content, '') || ' ' || COALESCE(url, '') || ' ' || COALESCE(source, ''))
);

-- 检查索引大小
SELECT pg_size_pretty(pg_relation_size('idx_content_detail_fulltext_search'));
```

## 当前代码配置

代码已更新为使用 'jiebacfg' 配置。如果 pg_jieba 未安装，请：

1. 安装 pg_jieba（推荐）
2. 或将代码中的 'jiebacfg' 替换为 'english' 或 'simple'
3. 或使用备用的字符串匹配方案

## 测试命令

```bash
# 测试搜索功能
curl "http://localhost:3000/api/detail?query=Orange.fr&page=1"
curl "http://localhost:3000/api/detail?query=网络安全&page=1"
curl "http://localhost:3000/api/detail?query=APT&page=1"
``` 