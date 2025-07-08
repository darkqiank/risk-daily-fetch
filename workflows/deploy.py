from fetch_all_blogs_links_flow import fetch_all_blogs_links_flow, fetch_old_blog_links_flow, fetch_blog_links_flow
from extract_links_ioc_flow import extract_ioc_flow, extract_links_ioc_flow, read_ym_data_flow, read_twitter_data_flow
from prefect import serve, flow

@flow(name="test_hello")
def test_hello():
    print("hello")
    return "hello"


if __name__ == "__main__":
    # 本地process部署
    fetch_blog_links_flow_deployment = fetch_blog_links_flow.to_deployment(name="获取单个博客链接")
    fetch_old_blog_links_flow_deployment = fetch_old_blog_links_flow.to_deployment(name="获取单个博客链接-老版本")
    fetch_all_blogs_links_flow_deployment = fetch_all_blogs_links_flow.to_deployment(name="获取所有博客链接")
    extract_ioc_flow_deployment = extract_ioc_flow.to_deployment(name="提取链接IOC")
    extract_links_ioc_flow_deployment = extract_links_ioc_flow.to_deployment(name="批量提取链接IOC")
    read_ym_data_flow_deployment = read_ym_data_flow.to_deployment(name="天际友盟爬虫")
    read_twitter_data_flow_deployment = read_twitter_data_flow.to_deployment(name="批量提取twitterIOC")
    hello_deployment = test_hello.to_deployment(name="测试", cron="0 0 * * *")
    serve(fetch_blog_links_flow_deployment, fetch_old_blog_links_flow_deployment, 
          fetch_all_blogs_links_flow_deployment,
          extract_ioc_flow_deployment,
          extract_links_ioc_flow_deployment,
          read_ym_data_flow_deployment,
          read_twitter_data_flow_deployment,
          hello_deployment)

    