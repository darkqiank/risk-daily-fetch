from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://socket.dev"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find all article elements with class 'chakra-linkbox css-6vqnpm'
    articles = soup.find_all('article', class_='chakra-linkbox css-6vqnpm')
    
    for article in articles:
        # Find the h3 heading with class 'chakra-heading css-1mlxxxy'
        h3 = article.find('h3', class_='chakra-heading css-1mlxxxy')
        if h3:
            # Find the anchor tag with class 'chakra-link chakra-linkbox__overlay css-8u809p'
            a = h3.find('a', class_='chakra-link chakra-linkbox__overlay css-8u809p')
            if a and 'href' in a.attrs:
                link = a['href']
                if not link.startswith('http'):
                    link = base_netloc + link
                links.append(link)
    
    return links