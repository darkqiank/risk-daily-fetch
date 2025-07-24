import json
from typing import List

# 常量，定义基础域名
base_netloc = "https://www.forescout.com"

def get_links(_content: str) -> List[str]:
    """
    从JSON格式的字符串中解析并提取文章链接列表。

    Args:
        _content: 包含文章数据的JSON格式字符串。

    Returns:
        一个包含所有正文文章完整URL的列表。
        如果解析失败或没有找到链接，则返回空列表。
    """
    links = []
    try:
        # 解析JSON字符串为Python对象（一个字典列表）
        data = json.loads(_content)
        
        # 确保数据是列表格式
        if not isinstance(data, list):
            print("警告: JSON内容不是一个列表。")
            return []
            
        # 遍历列表中的每一个项目（文章）
        for item in data:
            # 确保项目是字典且包含'type'和'link'键
            if isinstance(item, dict) and item.get("type") == "post" and "link" in item:
                # 提取'link'键对应的值，即文章链接
                article_link = item["link"]
                # 虽然本示例中的链接已是完整URL，但按要求确保URL是完整的
                # 如果链接是相对路径（如 /blog/...），则需要拼接
                if not article_link.startswith(('http://', 'https://')):
                    # 引入urljoin来更稳健地处理拼接
                    from urllib.parse import urljoin
                    links.append(urljoin(base_netloc, article_link))
                else:
                    links.append(article_link)

    except json.JSONDecodeError:
        print("错误: 输入的字符串不是有效的JSON格式。")
        return []
    except Exception as e:
        print(f"处理数据时发生未知错误: {e}")
        return []
        
    return links

# --- 使用示例 ---

# 您的JSON内容片段
json_content_snippet = """
[{"id":107414,"slug":"ot-security-leaders-improve-operational-resilience-with-harm-reduction","type":"post","link":"https://www.forescout.com/blog/ot-security-leaders-improve-operational-resilience-with-harm-reduction/","title":{"rendered":"OT Security Leaders, Improve Operational Resilience with Harm Reduction"},"excerpt":{"rendered":"<p>New data for OT leaders shows wide gaps in operational resilience. Boards and CISOs can use it to benchmark security maturity.</p>\\n","protected":false},"categories":[540],"tags":[],"acf":[],"featured_media_url":"https://www.forescout.com/wp-content/uploads/2025/07/Operational-Resilience-blog-feature-V1.webp"},{"id":107225,"slug":"post-quantum-cryptography-the-real-risks-of-not-adopting-it","type":"post","link":"https://www.forescout.com/blog/post-quantum-cryptography-the-real-risks-of-not-adopting-it/","title":{"rendered":"Post-Quantum Cryptography: The Real Risks of Not Adopting It"},"excerpt":{"rendered":"<p>Forescout’s Vedere Labs analyzes the real threats to not implementing post-quantum cryptography — and shows where real progress is being made.</p>\\n","protected":false},"categories":[540],"tags":[],"acf":[],"featured_media_url":"https://www.forescout.com/wp-content/uploads/2025/07/PQC-VL-Blog-feature-V1.png"},{"id":106935,"slug":"zta-transforms-fragmented-defenses-into-a-coordinated-security-model","type":"post","link":"https://www.forescout.com/blog/zta-transforms-fragmented-defenses-into-a-coordinated-security-model/","title":{"rendered":"ZTA Transforms Fragmented Defenses into a Coordinated Security Model"},"excerpt":{"rendered":"<p>ZTA requires the ability to observe, assess, and act at every layer of the security stack. See how Forescout and Microsoft Intune help achieve it.</p>\\n","protected":false},"categories":[540],"tags":[],"acf":[],"featured_media_url":"https://www.forescout.com/wp-content/uploads/2025/07/Blog-ZTA-2-feature-V3.webp"},{"id":106665,"slug":"attention-industrial-cisos-new-study-shows-maturity-needs-help","type":"post","link":"https://www.forescout.com/blog/attention-industrial-cisos-new-study-shows-maturity-needs-help/","title":{"rendered":"Attention, Industrial CISOs: New Study Shows Maturity Needs Help"},"excerpt":{"rendered":"<p>CISOs face widespread security maturity issues in manufacturing and industrial operations, according to new data in a Takepoint benchmark study.</p>\\n","protected":false},"categories":[540],"tags":[],"acf":[],"featured_media_url":"https://www.forescout.com/wp-content/uploads/2025/06/Blog-TakePoint-Blog-feature-V1.webp"},{"id":106506,"slug":"ransomware-services-exposed-behind-the-screens-of-the-lockbit-leak","type":"post","link":"https://www.forescout.com/blog/ransomware-services-exposed-behind-the-screens-of-the-lockbit-leak/","title":{"rendered":"Ransomware Services Exposed: Behind the Screens of the LockBit Leak"},"excerpt":{"rendered":"<p>Forescout’s Vedere Labs analyzes the nuanced behavior within ransomware services after a leak of LockBit affiliates was recently exposed.</p>\\n","protected":false},"categories":[540],"tags":[],"acf":[],"featured_media_url":"https://www.forescout.com/wp-content/uploads/2025/06/Lockbit-blog-feature.png"},{"id":106440,"slug":"why-self-healing-architecture-is-the-next-big-leap-in-cybersecurity","type":"post","link":"https://www.forescout.com/blog/why-self-healing-architecture-is-the-next-big-leap-in-cybersecurity/","title":{"rendered":"Why Self-Healing Architecture Is the Next Big Leap in Cybersecurity"},"excerpt":{"rendered":"<p>Self-healing architecture is the future of cybersecurity. Integrations between Forescout and GYPTOL are at the cutting edge of automated resilience.</p>\\n","protected":false},"categories":[540],"tags":[],"acf":[],"featured_media_url":"https://www.forescout.com/wp-content/uploads/2025/06/Blog-Self-Healing-Arch-Gytpol-Nav-V1-copy.webp"},{"id":106399,"slug":"the-security-risks-of-internet-exposed-solar-power-systems","type":"post","link":"https://www.forescout.com/blog/the-security-risks-of-internet-exposed-solar-power-systems/","title":{"rendered":"The Security Risks of Internet-Exposed Solar Power Systems"},"excerpt":{"rendered":"<p>Forescout’s Vedere Labs follows up on its solar power grid research to discuss the risks of internet-exposed administrative interfaces in inverters. </p>\\n","protected":false},"categories":[540],"tags":[],"acf":[],"featured_media_url":"https://www.forescout.com/wp-content/uploads/2025/05/Blog-Solar-Shodan-Feature-V2-080525.webp"},{"id":106261,"slug":"cybersecurity-in-manufacturing-threats-trends-and-preparation","type":"post","link":"https://www.forescout.com/blog/cybersecurity-in-manufacturing-threats-trends-and-preparation/","title":{"rendered":"Cybersecurity in Manufacturing: Threats, Trends, and Preparation"},"excerpt":{"rendered":"<p>Forescout’s Vedere Labs spotlights cybersecurity in manufacturing with a detailed look at the threats and techniques plaguing the industry.</p>\\n","protected":false},"categories":[540],"tags":[],"acf":[],"featured_media_url":"https://www.forescout.com/wp-content/uploads/2025/05/Blog-MFG-Landscape-feature-V1.webp"},{"id":106114,"slug":"critical-condition-the-growing-threat-of-healthcare-data-breaches","type":"post","link":"https://www.forescout.com/blog/critical-condition-the-growing-threat-of-healthcare-data-breaches/","title":{"rendered":"Critical Condition: The Growing Threat of Healthcare Data Breaches"},"excerpt":{"rendered":"<p>Forescout’s Vedere Labs analyzes recent healthcare data breach information to better understand the state of cybersecurity in this industry. </p>\\n","protected":false},"categories":[540],"tags":[],"acf":[],"featured_media_url":"https://www.forescout.com/wp-content/uploads/2025/05/Blog-DataBreaches-feature_V2.webp"}]
"""

# 调用函数并传入JSON内容
extracted_links = get_links(json_content_snippet)

# 打印结果
print("提取到的文章链接列表:")
# 为了美观，逐行打印
for link in extracted_links:
    print(link)

# 打印最终的列表格式
print("\n返回的列表格式:")
print(f"links = {extracted_links}")