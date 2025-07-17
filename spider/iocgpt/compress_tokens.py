import jieba
import jieba.analyse
import gensim
from gensim import corpora, models
from gensim.models import Word2Vec, TfidfModel
from gensim.similarities import Similarity
import re
import math
import numpy as np
from collections import Counter, defaultdict
from typing import List, Tuple, Dict, Optional
import json
import tiktoken

# 初始化jieba
jieba.initialize()

class TextCompressor:
    """基于jieba和gensim的中文文章压缩器"""
    
    def __init__(self, 
                 compression_ratio: float = 0.3,
                 min_sentence_length: int = 5,
                 max_sentence_length: int = 200,
                 keyword_ratio: float = 0.2,
                 similarity_threshold: float = 0.7):
        """
        初始化参数
        compression_ratio: 目标压缩比例
        min_sentence_length: 最小句子长度
        max_sentence_length: 最大句子长度
        keyword_ratio: 关键词提取比例
        similarity_threshold: 句子相似度阈值
        """
        self.compression_ratio = compression_ratio
        self.min_sentence_length = min_sentence_length
        self.max_sentence_length = max_sentence_length
        self.keyword_ratio = keyword_ratio
        self.similarity_threshold = similarity_threshold
        
        # 停用词设置
        self.stopwords = self._load_stopwords()
        
        # 模型缓存
        self.tfidf_model = None
        self.dictionary = None
        self.word2vec_model = None
        
    def _load_stopwords(self) -> set:
        """加载中文停用词表"""
        # 基础中文停用词
        basic_stopwords = {
            '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那', '里', '就是', '还', '把', '来', '当', '都是', '这个', '那个', '什么', '怎么', '这样', '那样', '可以', '如果', '因为', '所以', '但是', '然后', '而且', '或者', '以及', '等等', '之前', '之后', '现在', '以前', '以后', '比较', '非常', '特别', '尤其', '特别是', '包括', '除了', '另外', '此外', '而且', '以及'
        }
        
        # 添加标点符号
        punctuation = '！？｡。＂＃＄％＆＇（）＊＋，－／：；＜＝＞＠［＼］＾＿｀｛｜｝～｟｠｢｣､、〃》「」『』【】〔〕〖〗〘〙〚〛〜〝〞〟〰〽゛゜ゝゞ・ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶ'
        
        for p in punctuation:
            basic_stopwords.add(p)
            
        return basic_stopwords
    
    def preprocess_text(self, text: str) -> List[str]:
        """文本预处理：分句和清洗"""
        # 按句号、感叹号、问号分句
        sentences = re.split(r'[。！？\n]', text)
        
        # 清洗和过滤句子
        cleaned_sentences = []
        for sentence in sentences:
            sentence = sentence.strip()
            if (self.min_sentence_length <= len(sentence) <= self.max_sentence_length 
                and sentence):
                cleaned_sentences.append(sentence)
        
        return cleaned_sentences
    
    def segment_text(self, text: str) -> List[str]:
        """中文分词"""
        # 使用jieba进行分词
        words = jieba.lcut(text)
        
        # 过滤停用词和标点
        filtered_words = [word for word in words 
                         if word not in self.stopwords 
                         and len(word.strip()) > 1
                         and not word.isspace()
                         and not word.isdigit()]
        
        return filtered_words
    
    def extract_keywords(self, text: str, topk: int = None) -> List[Tuple[str, float]]:
        """提取关键词"""
        if topk is None:
            # 根据文本长度动态确定关键词数量
            word_count = len(self.segment_text(text))
            topk = max(5, int(word_count * self.keyword_ratio))
        
        # 使用jieba的TF-IDF关键词提取
        tfidf_keywords = jieba.analyse.extract_tags(
            text, topK=topk, withWeight=True, allowPOS=('n', 'v', 'a', 'nr', 'ns', 'nt')
        )
        
        # 使用jieba的TextRank关键词提取
        textrank_keywords = jieba.analyse.textrank(
            text, topK=topk, withWeight=True, allowPOS=('n', 'v', 'a', 'nr', 'ns', 'nt')
        )
        
        # 合并和加权两种方法的结果
        keyword_scores = defaultdict(float)
        
        for word, score in tfidf_keywords:
            keyword_scores[word] += score * 0.6
            
        for word, score in textrank_keywords:
            keyword_scores[word] += score * 0.4
        
        # 排序并返回
        sorted_keywords = sorted(keyword_scores.items(), key=lambda x: x[1], reverse=True)
        return sorted_keywords[:topk]
    
    def build_tfidf_model(self, sentences: List[str]):
        """构建TF-IDF模型"""
        # 对每个句子进行分词
        tokenized_sentences = [self.segment_text(sentence) for sentence in sentences]
        
        # 构建词典
        self.dictionary = corpora.Dictionary(tokenized_sentences)
        
        # 构建语料库（词袋表示）
        corpus = [self.dictionary.doc2bow(tokens) for tokens in tokenized_sentences]
        
        # 训练TF-IDF模型
        self.tfidf_model = TfidfModel(corpus)
        
        return corpus, tokenized_sentences
    
    def calculate_sentence_importance(self, sentences: List[str], 
                                    keywords: List[Tuple[str, float]]) -> List[Tuple[str, float]]:
        """计算句子重要性得分"""
        if not sentences:
            return []
        
        # 构建TF-IDF模型
        corpus, tokenized_sentences = self.build_tfidf_model(sentences)
        
        # 关键词权重字典
        keyword_weights = dict(keywords)
        
        sentence_scores = []
        
        for i, (sentence, tokens) in enumerate(zip(sentences, tokenized_sentences)):
            score = 0.0
            
            # 1. 关键词覆盖度得分
            keyword_score = 0.0
            for token in tokens:
                if token in keyword_weights:
                    keyword_score += keyword_weights[token]
            keyword_score = keyword_score / len(tokens) if tokens else 0
            
            # 2. TF-IDF得分
            if i < len(corpus) and self.tfidf_model:
                tfidf_vector = self.tfidf_model[corpus[i]]
                tfidf_score = sum(weight for _, weight in tfidf_vector) / len(tokens) if tokens else 0
            else:
                tfidf_score = 0
            
            # 3. 句子位置得分（首尾句子权重更高）
            position_score = 1.0
            if i < len(sentences) * 0.2:  # 前20%
                position_score = 1.5
            elif i > len(sentences) * 0.8:  # 后20%
                position_score = 1.3
            
            # 4. 句子长度得分（中等长度优先）
            length_score = 1.0
            sentence_length = len(sentence)
            if 20 <= sentence_length <= 100:
                length_score = 1.2
            elif sentence_length < 10 or sentence_length > 150:
                length_score = 0.8
            
            # 5. 数字和特殊符号惩罚
            special_penalty = 1.0
            digit_ratio = sum(1 for c in sentence if c.isdigit()) / len(sentence)
            if digit_ratio > 0.3:  # 如果数字占比超过30%
                special_penalty = 0.5
            
            # 综合得分计算
            score = (keyword_score * 0.4 + 
                    tfidf_score * 0.3 + 
                    position_score * 0.15 + 
                    length_score * 0.1 + 
                    special_penalty * 0.05)
            
            sentence_scores.append((sentence, score))
        
        return sentence_scores
    
    def remove_redundant_sentences(self, sentence_scores: List[Tuple[str, float]]) -> List[Tuple[str, float]]:
        """去除冗余句子"""
        if len(sentence_scores) <= 1:
            return sentence_scores
        
        # 构建句子的词向量表示
        sentences = [item[0] for item in sentence_scores]
        sentence_vectors = []
        
        for sentence in sentences:
            tokens = self.segment_text(sentence)
            if tokens and self.dictionary:
                # 使用TF-IDF向量表示句子
                bow = self.dictionary.doc2bow(tokens)
                if self.tfidf_model:
                    tfidf_vector = self.tfidf_model[bow]
                    # 转换为密集向量
                    vector = np.zeros(len(self.dictionary))
                    for token_id, weight in tfidf_vector:
                        vector[token_id] = weight
                    sentence_vectors.append(vector)
                else:
                    sentence_vectors.append(np.zeros(len(self.dictionary)))
            else:
                sentence_vectors.append(np.zeros(100))  # 默认维度
        
        # 计算句子间相似度并去重
        filtered_sentences = []
        used_indices = set()
        
        # 按重要性排序
        sorted_sentence_scores = sorted(sentence_scores, key=lambda x: x[1], reverse=True)
        
        for sentence, score in sorted_sentence_scores:
            current_index = sentences.index(sentence)
            
            if current_index in used_indices:
                continue
            
            # 检查与已选择句子的相似度
            is_redundant = False
            current_vector = sentence_vectors[current_index]
            
            for selected_sentence, _ in filtered_sentences:
                selected_index = sentences.index(selected_sentence)
                selected_vector = sentence_vectors[selected_index]
                
                # 计算余弦相似度
                similarity = self._cosine_similarity(current_vector, selected_vector)
                
                if similarity > self.similarity_threshold:
                    is_redundant = True
                    break
            
            if not is_redundant:
                filtered_sentences.append((sentence, score))
                used_indices.add(current_index)
        
        return filtered_sentences
    
    def _cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """计算余弦相似度"""
        if np.linalg.norm(vec1) == 0 or np.linalg.norm(vec2) == 0:
            return 0.0
        
        return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
    
    def compress_text(self, text: str, target_compression: Optional[float] = None) -> Tuple[str, Dict]:
        """主要的文本压缩函数"""
        if not text.strip():
            return text, {'error': '输入文本为空'}
        
        target_compression = target_compression or self.compression_ratio
        original_length = len(text)
        
        # 1. 文本预处理：分句
        sentences = self.preprocess_text(text)
        
        if not sentences:
            return text, {'error': '无法提取有效句子'}
        
        # 2. 提取关键词
        keywords = self.extract_keywords(text)
        
        # 3. 计算句子重要性
        sentence_scores = self.calculate_sentence_importance(sentences, keywords)
        
        # 4. 去除冗余句子
        filtered_sentences = self.remove_redundant_sentences(sentence_scores)
        
        # 5. 根据目标压缩率选择句子
        target_sentence_count = max(1, int(len(sentences) * (1 - target_compression)))
        
        # 确保不超过过滤后的句子数量
        target_sentence_count = min(target_sentence_count, len(filtered_sentences))
        
        # 选择得分最高的句子
        selected_sentences = sorted(filtered_sentences, key=lambda x: x[1], reverse=True)[:target_sentence_count]
        
        # 6. 按原文顺序重新排列选中的句子
        original_order_sentences = []
        selected_sentence_texts = {item[0] for item in selected_sentences}
        
        for sentence in sentences:
            if sentence in selected_sentence_texts:
                original_order_sentences.append(sentence)
        
        # 7. 生成压缩后的文本
        compressed_text = '。'.join(original_order_sentences)
        if compressed_text and not compressed_text.endswith('。'):
            compressed_text += '。'
        
        # 8. 统计信息
        stats = {
            'original_length': original_length,
            'compressed_length': len(compressed_text),
            'compression_ratio': (original_length - len(compressed_text)) / original_length if original_length > 0 else 0,
            'original_sentence_count': len(sentences),
            'compressed_sentence_count': len(original_order_sentences),
            'keywords_extracted': len(keywords),
            'top_keywords': keywords[:5] if keywords else []
        }
        
        return compressed_text, stats
    
    def batch_compress(self, texts: List[str], target_compression: Optional[float] = None) -> List[Tuple[str, Dict]]:
        """批量压缩文本"""
        results = []
        for text in texts:
            compressed, stats = self.compress_text(text, target_compression)
            results.append((compressed, stats))
        return results
    
    def extract_summary(self, text: str, summary_ratio: float = 0.1) -> str:
        """提取文本摘要（更高的压缩率）"""
        compressed, _ = self.compress_text(text, summary_ratio)
        return compressed