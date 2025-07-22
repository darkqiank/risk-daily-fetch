from bs4 import BeautifulSoup

def get_links(_content):
    # card-block__title
    soup = BeautifulSoup(_content, "html.parser")
    items = soup.find_all("h3", class_="card-block__title")
    links = []
    for item in items:
        a = item.findNext("a")
        if a and a.has_attr("href"):
            links.append(a["href"])
    return links
