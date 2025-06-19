from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.attackiq.com"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find the main blog posts section
    blog_section = soup.find('section', class_='blog-page')
    if blog_section:
        # Find all blog post articles
        articles = blog_section.find_all('article', class_='blog-post')
        for article in articles:
            # Find the link in each article
            link_tag = article.find('a', href=True)
            if link_tag:
                link = link_tag['href']
                if not link.startswith('http'):
                    link = base_netloc + link
                links.append(link)
    
    return links