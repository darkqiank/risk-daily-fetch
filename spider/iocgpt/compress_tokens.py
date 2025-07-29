import jieba
import jieba.analyse
import re
import math
import numpy as np
from collections import Counter, defaultdict
from typing import List, Tuple, Dict, Optional
import json
import tiktoken
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import hashlib

# 初始化jieba
jieba.initialize()

class TextCompressor:
    """高性能中文文章压缩器 - 优化版本"""
    
    def __init__(self, 
                 compression_ratio: float = 0.3,
                 min_sentence_length: int = 5,
                 max_sentence_length: int = 200,
                 keyword_ratio: float = 0.15,
                 similarity_threshold: float = 0.75,
                 max_sentences: int = 300):  # 新增：限制最大处理句子数
        """
        初始化参数 - 优化版本
        max_sentences: 最大处理句子数，超过此数量将进行预筛选
        """
        self.compression_ratio = compression_ratio
        self.min_sentence_length = min_sentence_length
        self.max_sentence_length = max_sentence_length
        self.keyword_ratio = keyword_ratio
        self.similarity_threshold = similarity_threshold
        self.max_sentences = max_sentences
        
        # 停用词设置（简化版）
        self.stopwords = self._load_basic_stopwords()
        
        # 缓存机制
        self._segmentation_cache = {}
        self._keyword_cache = {}
        
    def _load_basic_stopwords(self) -> set:
        """加载基础停用词表（简化版）"""
        return {
            '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那', '里', '还', '把', '来', '当', '这个', '那个', '什么', '怎么', '可以', '如果', '因为', '所以', '但是', '然后', '而且', '或者', '以及', '等等', '之前', '之后', '现在', '以前', '以后', '比较', '非常', '特别', '包括', '除了', '另外', '此外'
        }
    
    def _get_text_hash(self, text: str) -> str:
        """获取文本哈希用于缓存"""
        return hashlib.md5(text.encode('utf-8')).hexdigest()[:12]
    
    def preprocess_text(self, text: str) -> List[str]:
        """快速文本预处理"""
        # 更激进的分句（提高性能）
        sentences = re.split(r'[。！？\n]', text)
        
        # 快速过滤
        cleaned_sentences = []
        for sentence in sentences:
            sentence = sentence.strip()
            if (self.min_sentence_length <= len(sentence) <= self.max_sentence_length 
                and sentence and not sentence.isspace()):
                cleaned_sentences.append(sentence)
                
                # 早期退出：如果句子过多，只保留前面的部分
                if len(cleaned_sentences) >= self.max_sentences * 2:
                    break
        
        return cleaned_sentences
    
    def segment_text_cached(self, text: str) -> List[str]:
        """带缓存的分词"""
        text_hash = self._get_text_hash(text)
        if text_hash in self._segmentation_cache:
            return self._segmentation_cache[text_hash]
        
        # 快速分词
        words = jieba.lcut(text)
        
        # 简化的过滤
        filtered_words = [word for word in words 
                         if (word not in self.stopwords 
                             and len(word.strip()) > 1
                             and not word.isspace()
                             and not word.isdigit())]
        
        # 缓存结果
        if len(self._segmentation_cache) < 1000:  # 限制缓存大小
            self._segmentation_cache[text_hash] = filtered_words
        
        return filtered_words
    
    def extract_keywords_fast(self, text: str, topk: int = None) -> List[Tuple[str, float]]:
        """快速关键词提取 - 只使用TF-IDF"""
        if topk is None:
            word_count = len(self.segment_text_cached(text))
            topk = max(5, min(20, int(word_count * self.keyword_ratio)))  # 限制最大关键词数
        
        text_hash = self._get_text_hash(text)
        cache_key = f"{text_hash}_{topk}"
        
        if cache_key in self._keyword_cache:
            return self._keyword_cache[cache_key]
        
        # 只使用TF-IDF（比TextRank快很多）
        keywords = jieba.analyse.extract_tags(
            text, topK=topk, withWeight=True, allowPOS=('n', 'v', 'a', 'nr', 'ns', 'nt')
        )
        
        # 缓存结果
        if len(self._keyword_cache) < 500:
            self._keyword_cache[cache_key] = keywords
        
        return keywords
    
    def calculate_simple_importance(self, sentences: List[str], 
                                  keywords: List[Tuple[str, float]]) -> List[Tuple[str, float]]:
        """简化的句子重要性计算"""
        if not sentences:
            return []
        
        keyword_weights = dict(keywords)
        sentence_scores = []
        
        for i, sentence in enumerate(sentences):
            score = 0.0
            
            # 1. 关键词覆盖度（主要指标）
            tokens = self.segment_text_cached(sentence)
            keyword_score = 0.0
            for token in tokens:
                if token in keyword_weights:
                    keyword_score += keyword_weights[token]
            keyword_score = keyword_score / len(tokens) if tokens else 0
            
            # 2. 位置得分（简化）
            position_score = 1.0
            if i < len(sentences) * 0.15:  # 前15%
                position_score = 1.3
            elif i > len(sentences) * 0.85:  # 后15%
                position_score = 1.2
            
            # 3. 长度得分（简化）
            length_score = 1.0
            sentence_length = len(sentence)
            if 15 <= sentence_length <= 80:
                length_score = 1.1
            elif sentence_length < 8:
                length_score = 0.6
            
            # 简化的综合得分
            score = keyword_score * 0.7 + position_score * 0.2 + length_score * 0.1
            sentence_scores.append((sentence, score))
        
        return sentence_scores
    
    def remove_redundant_fast(self, sentence_scores: List[Tuple[str, float]]) -> List[Tuple[str, float]]:
        """快速去重 - 使用更简单的方法"""
        if len(sentence_scores) <= 1:
            return sentence_scores
        
        # 按重要性排序
        sorted_sentences = sorted(sentence_scores, key=lambda x: x[1], reverse=True)
        
        filtered_sentences = []
        used_keywords = set()
        
        for sentence, score in sorted_sentences:
            # 使用关键词重叠度进行快速去重
            tokens = self.segment_text_cached(sentence)
            
            # 计算与已选句子的关键词重叠度
            overlap_ratio = 0.0
            if used_keywords and tokens:
                overlap_count = sum(1 for token in tokens if token in used_keywords)
                overlap_ratio = overlap_count / len(tokens)
            
            # 如果重叠度低于阈值，则保留
            if overlap_ratio < 0.6:  # 调整为基于关键词的重叠阈值
                filtered_sentences.append((sentence, score))
                used_keywords.update(tokens)
                
                # 限制选择的句子数量，避免过度计算
                if len(filtered_sentences) >= min(50, len(sentence_scores) // 2):
                    break
        
        return filtered_sentences
    
    def compress_text(self, text: str, target_compression: Optional[float] = None) -> Tuple[str, Dict]:
        """主要的文本压缩函数 - 性能优化版"""
        if not text.strip():
            return text, {'error': '输入文本为空'}
        
        target_compression = target_compression or self.compression_ratio
        original_length = len(text)
        
        # 早期退出：如果文本太短，直接返回
        if original_length < 100:
            return text, {
                'original_length': original_length,
                'compressed_length': original_length,
                'compression_ratio': 0.0,
                'note': '文本过短，未压缩'
            }
        
        # 1. 快速预处理
        sentences = self.preprocess_text(text)
        
        if not sentences:
            return text, {'error': '无法提取有效句子'}
        
        # 2. 如果句子太多，先进行粗筛选
        if len(sentences) > self.max_sentences:
            # 基于长度和位置的粗筛选
            sentences = self._coarse_filter(sentences)
        
        # 3. 快速关键词提取
        keywords = self.extract_keywords_fast(text)
        
        # 4. 简化的重要性计算
        sentence_scores = self.calculate_simple_importance(sentences, keywords)
        
        # 5. 快速去重
        filtered_sentences = self.remove_redundant_fast(sentence_scores)
        
        # 6. 选择句子
        target_sentence_count = max(1, int(len(sentences) * (1 - target_compression)))
        target_sentence_count = min(target_sentence_count, len(filtered_sentences))
        
        selected_sentences = sorted(filtered_sentences, key=lambda x: x[1], reverse=True)[:target_sentence_count]
        
        # 7. 按原文顺序重新排列
        original_order_sentences = []
        selected_sentence_texts = {item[0] for item in selected_sentences}
        
        for sentence in sentences:
            if sentence in selected_sentence_texts:
                original_order_sentences.append(sentence)
        
        # 8. 生成压缩文本
        compressed_text = '。'.join(original_order_sentences)
        if compressed_text and not compressed_text.endswith('。'):
            compressed_text += '。'
        
        # 9. 统计信息
        stats = {
            'original_length': original_length,
            'compressed_length': len(compressed_text),
            'compression_ratio': (original_length - len(compressed_text)) / original_length if original_length > 0 else 0,
            'original_sentence_count': len(sentences),
            'compressed_sentence_count': len(original_order_sentences),
            'keywords_extracted': len(keywords),
            'processing_time': 'optimized'
        }
        
        return compressed_text, stats
    
    def _coarse_filter(self, sentences: List[str]) -> List[str]:
        """粗筛选句子"""
        # 保留前30%、后10%和中间长度适中的句子
        total = len(sentences)
        front_count = int(total * 0.3)
        back_count = int(total * 0.1)
        
        selected = sentences[:front_count] + sentences[-back_count:]
        
        # 从中间部分选择长度适中的句子
        middle_sentences = sentences[front_count:-back_count if back_count > 0 else total]
        middle_selected = [s for s in middle_sentences if 20 <= len(s) <= 100]
        
        # 限制中间部分的句子数量
        if len(middle_selected) > self.max_sentences - len(selected):
            step = len(middle_selected) // (self.max_sentences - len(selected))
            middle_selected = middle_selected[::max(1, step)]
        
        selected.extend(middle_selected)
        return selected[:self.max_sentences]
    
    def batch_compress(self, texts: List[str], target_compression: Optional[float] = None) -> List[Tuple[str, Dict]]:
        """批量压缩文本"""
        results = []
        for i, text in enumerate(texts):
            compressed, stats = self.compress_text(text, target_compression)
            results.append((compressed, stats))
            
            # 定期清理缓存避免内存溢出
            if i % 100 == 0:
                self._clear_cache()
        
        return results
    
    def _clear_cache(self):
        """清理缓存"""
        if len(self._segmentation_cache) > 1000:
            # 保留最近的一半
            items = list(self._segmentation_cache.items())
            self._segmentation_cache = dict(items[-500:])
        
        if len(self._keyword_cache) > 500:
            items = list(self._keyword_cache.items())
            self._keyword_cache = dict(items[-250:])
    
    def extract_summary(self, text: str, summary_ratio: float = 0.1) -> str:
        """提取文本摘要"""
        compressed, _ = self.compress_text(text, summary_ratio)
        return compressed