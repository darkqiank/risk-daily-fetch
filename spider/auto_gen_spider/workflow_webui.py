import os
import json
import time
from urllib.parse import urlparse
import streamlit as st
import streamlit.components.v1 as components
from pathlib import Path
from typing import List, Dict, Any, Union
from dotenv import load_dotenv

load_dotenv(".env")

from workflow_gen import (
    TEMP_DIR, init_module, load_blog_module, 
    call_llm_api, gen_parse_directory_code, gen_parse_article_code,
    save_code_to_temp, load_code_from_temp, run_code,
    compress_html, detect_content_type
)
from utils import publish_module

# 设置页面配置
st.set_page_config(
    page_title="博客数据采集工作流",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded",
)

current_file_dir = os.path.dirname(os.path.abspath(__file__))

def init_session_state():
    # 初始化会话状态
    if "blog_name" not in st.session_state:
        st.session_state.blog_name = ""
    if "blog_url" not in st.session_state:
        st.session_state.blog_url = ""
    if "base_netloc" not in st.session_state:
        st.session_state.base_netloc = ""
    if "module_loaded" not in st.session_state:
        st.session_state.module_loaded = False
    if "links" not in st.session_state:
        st.session_state.links = []
    if "selected_link" not in st.session_state:
        st.session_state.selected_link = ""
    if "selected_links" not in st.session_state:
        st.session_state.selected_links = []
    if "articles" not in st.session_state:
        st.session_state.articles = []
    if "dir_content" not in st.session_state:
        st.session_state.dir_content = ""
    if "dir_content_type" not in st.session_state:
        st.session_state.dir_content_type = ""
    if "dir_code" not in st.session_state:
        st.session_state.dir_code = ""
    if "article_content" not in st.session_state:
        st.session_state.article_content = ""
    if "article_content_type" not in st.session_state:
        st.session_state.article_content_type = ""
    if "article_code" not in st.session_state:
        st.session_state.article_code = ""
    if "use_proxy" not in st.session_state:
        st.session_state.use_proxy = False
    if "new_blog_url" not in st.session_state:
        st.session_state.new_blog_url = ""
    if "auto_base_netloc" not in st.session_state:
        st.session_state.auto_base_netloc = ""
    if "auto_blog_name" not in st.session_state:
        st.session_state.auto_blog_name = ""


# 获取已有模块列表
def get_existing_modules():
    modules = []
    if TEMP_DIR.exists():
        for item in TEMP_DIR.iterdir():
            if item.is_dir() and (item / "__init__.py").exists():
                modules.append(item.name)
    return modules

init_session_state()

# 侧边栏 - 模块管理
with st.sidebar:
    st.title("博客数据采集工作流")
    
    # 模块选择或创建
    st.header("模块管理")
    
    module_option = st.radio(
        "选择操作",
        ["加载现有模块", "创建新模块"]
    )
    
    if module_option == "加载现有模块":
        existing_modules = get_existing_modules()
        if existing_modules:
            selected_module = st.selectbox("选择模块", existing_modules)
            load_button_col1, _ = st.columns([1, 1])
            with load_button_col1:
                if st.button("加载模块", use_container_width=True):
                    # 初始化状态
                    st.session_state.clear()
                    init_session_state()
                    st.session_state.blog_name = selected_module
                    try:
                        module = load_blog_module(TEMP_DIR, selected_module)
                        st.session_state.blog_url = module.BASE_URL
                        st.session_state.base_netloc = module.BASE_NETLOC
                        st.session_state.module_loaded = True
                        st.success(f"成功加载模块: {selected_module}")
                    except Exception as e:
                        st.error(f"加载模块失败: {str(e)}")
        else:
            st.info("没有找到现有模块")
    
    else:  # 创建新模块
        st.subheader("创建新模块")
        
        def auto_generate_module_name():
            t_url = st.session_state.new_blog_url
            if t_url:
                t_parsed_url = urlparse(t_url)
                t_base_netloc = f"{t_parsed_url.scheme}://{t_parsed_url.netloc}"
                t_blog_name = t_parsed_url.netloc.replace(".", "_").replace("-", "_")
                st.session_state.auto_base_netloc = t_base_netloc
                st.session_state.auto_blog_name = t_blog_name
            else:
                st.session_state.auto_base_netloc = ""
                st.session_state.auto_blog_name = ""
            
        # URL输入（在表单外部）
        tmp_blog_url = st.text_input("博客URL", key="new_blog_url", on_change=auto_generate_module_name)

        # 显示自动生成的值
        tmp_base_netloc = st.text_input("基础网址", value=st.session_state.auto_base_netloc, key="new_base_netloc")
        tmp_blog_name = st.text_input("模块名称", value=st.session_state.auto_blog_name, key="new_blog_name")
        
        # 其他设置
        fetch_method = st.selectbox("抓取方法", ["curl_cffi", "httpx", "playwright", "pdf"], key="new_fetch_method")
        source_type = st.selectbox("内容类型", ["html", "rss"], key="new_source_type")
        
        # 创建按钮
        submit_button = st.button("创建模块", key="create_module_button", use_container_width=True)
        if submit_button:
            if tmp_blog_name and tmp_blog_url and tmp_base_netloc:
                try:
                    # 初始化状态
                    st.session_state.clear()
                    init_session_state()
                    st.session_state.blog_name = tmp_blog_name
                    st.session_state.blog_url = tmp_blog_url
                    st.session_state.base_netloc = tmp_base_netloc
                    module_path, module = init_module(
                        st.session_state.blog_name, 
                        st.session_state.blog_url, 
                        base_netloc=st.session_state.base_netloc,
                        fetch=fetch_method,
                        source_type=source_type,
                        overwrite=True
                    )
                    st.session_state.module_loaded = True
                    if not st.session_state.base_netloc:
                        st.session_state.base_netloc = module.BASE_NETLOC
                    st.success(f"成功创建模块: {st.session_state.blog_name}")
                except Exception as e:
                    st.error(f"创建模块失败: {str(e)}")
            else:
                st.warning("请填写模块名称和博客URL")

            
    # 显示当前加载的模块信息
    if st.session_state.module_loaded:
        st.markdown("---")
        st.subheader("当前模块")
        info_container = st.container(border=True)
        with info_container:
            st.write(f"**名称:** {st.session_state.blog_name}")
            st.write(f"**URL:** {st.session_state.blog_url}")
            st.write(f"**基础网址:** {st.session_state.base_netloc}")
            # 添加发布按钮
            st.markdown("---")
            publish_col1, publish_col2 = st.columns([2, 1])
            with publish_col1:
                if st.button("📤 发布到生产", key="publish_module", use_container_width=True):
                    with st.spinner("正在发布模块..."):
                        try:
                            # 创建生产目录
                            prod_dir = Path(current_file_dir + "/../blogs")
                            prod_dir.mkdir(exist_ok=True)
                            
                            # 执行发布
                            if publish_module(st.session_state.blog_name, TEMP_DIR, prod_dir):
                                st.success(f"✅ 模块已成功发布到: {prod_dir / st.session_state.blog_name}")
                            else:
                                st.error("❌ 发布失败")
                        except Exception as e:
                            st.error(f"❌ 发布出错: {str(e)}")

# 主界面 - 工作流程
if not st.session_state.module_loaded:
    st.info("请先从侧边栏加载或创建一个模块")
else:
    # 创建工作流程标签页
    tab1, tab2 = st.tabs(["链接提取工作流", "文章内容提取工作流"])
    
    # 链接提取工作流
    with tab1:
        st.header("链接提取工作流")
        
        # 步骤1: 获取博客首页内容
        with st.container(border=True):
            st.subheader("步骤1: 获取博客首页内容")
            
            url_to_fetch = st.text_input("URL", st.session_state.blog_url, key="dir_url")
            
            fetch_col1, fetch_col2 = st.columns(2)
            with fetch_col1:
                use_proxy = st.toggle("启用代理", value=st.session_state.use_proxy, key="use_proxy_toggle_1")
                st.session_state.use_proxy = use_proxy
            with fetch_col2:
                if st.button("获取内容", key="fetch_dir", use_container_width=True):
                    with st.spinner("正在获取内容..."):
                        try:
                            module = load_blog_module(TEMP_DIR, st.session_state.blog_name)
                            
                            content = module.fetch_url(url_to_fetch, use_proxy=st.session_state.use_proxy)
                            content_type = detect_content_type(content)
                            
                            if content:
                                st.session_state.dir_content = content
                                st.session_state.dir_content_type = content_type
                                st.success(f"成功获取内容，类型: {content_type}")
                            else:
                                st.error("获取内容失败")
                        except Exception as e:
                            st.error(f"获取内容出错: {str(e)}")
            
            if st.session_state.dir_content:
                with st.expander("查看获取的内容"):
                    tab_preview, tab_source = st.tabs(["网页预览", "原始内容"])
                    
                    with tab_preview:
                        components.html(
                            st.session_state.dir_content,
                            height=400,  # 设置一个固定高度
                            scrolling=True  # 启用滚动
                        )
                    
                    with tab_source:
                        st.text_area(
                            "原始内容",
                            st.session_state.dir_content,
                            height=400,
                            disabled=True
                        )
        
        # 步骤2: 生成链接提取代码
        with st.container(border=True):
            st.subheader("步骤2: 生成链接提取代码")
            
            # 尝试默认加载已有代码
            if not st.session_state.dir_code:
                try:
                    code_path = Path(TEMP_DIR) / st.session_state.blog_name / "get_links.py"
                    if code_path.exists():
                        with open(code_path, "r", encoding="utf-8") as f:
                            st.session_state.dir_code = f.read()
                        st.info("已自动加载已有代码")
                except Exception as e:
                    pass  # 静默失败，不显示错误
            
            st.write(f"**内容类型:** {st.session_state.dir_content_type}")
            
            button_col1, button_col2 = st.columns(2)
            with button_col1:
                if st.button("生成代码", key="gen_dir_code", use_container_width=True):
                    if st.session_state.dir_content:
                        with st.spinner("正在生成代码..."):
                            try:
                                _c_content = compress_html(st.session_state.dir_content) if st.session_state.dir_content_type == "html" else st.session_state.dir_content
                                print("orgin_length", len(st.session_state.dir_content))
                                print("_c_content_length", len(_c_content))
                                dir_code = gen_parse_directory_code(
                                    st.session_state.base_netloc,
                                    _c_content,
                                    content_type=st.session_state.dir_content_type
                                )
                                
                                if dir_code:
                                    st.session_state.dir_code = dir_code
                                    st.success("成功生成链接提取代码")
                                    save_path = Path(TEMP_DIR) / st.session_state.blog_name / "get_links.py"
                                    save_code_to_temp(save_path, st.session_state.dir_code)
                                    st.success(f"代码已自动保存到: {save_path}")
                                else:
                                    st.error("生成代码失败")
                            except Exception as e:
                                st.error(f"生成代码出错: {str(e)}")
                    else:
                        st.warning("请先获取内容")
            
            with button_col2:
                if st.button("保存代码", key="save_dir_code", use_container_width=True):
                    if st.session_state.dir_code:
                        try:
                            save_path = Path(TEMP_DIR) / st.session_state.blog_name / "get_links.py"
                            save_code_to_temp(save_path, st.session_state.dir_code)
                            st.success(f"代码已保存到: {save_path}")
                        except Exception as e:
                            st.error(f"保存代码出错: {str(e)}")
                    else:
                        st.warning("没有代码可保存")
            
            if st.session_state.dir_code:
                st.session_state.dir_code = st.text_area("链接提取代码", st.session_state.dir_code, height=300)
        
        # 步骤3: 执行链接提取代码
        with st.container(border=True):
            st.subheader("步骤3: 执行链接提取代码")
            
            button_col1, button_col2 = st.columns(2)
            with button_col1:
                if st.button("执行代码", key="run_dir_code", use_container_width=True):
                    if st.session_state.dir_code and st.session_state.dir_content:
                        with st.spinner("正在执行代码..."):
                            try:
                                links = run_code(st.session_state.dir_code, "get_links", _content=st.session_state.dir_content)
                                
                                if links:
                                    st.session_state.links = links
                                    st.success(f"成功提取 {len(links)} 个链接")
                                else:
                                    st.warning("未提取到链接")
                            except Exception as e:
                                st.error(f"执行代码出错: {str(e)}")
                    else:
                        st.warning("请先生成代码")
            
            if st.session_state.links:
                with st.expander("查看提取的链接", expanded=True):
                    st.write(f"**共提取到 {len(st.session_state.links)} 个链接**")
                    st.json(st.session_state.links)

    
    # 文章内容提取工作流
    with tab2:
        st.header("文章内容提取工作流")
        
        if not st.session_state.links:
            st.info("请先在链接提取工作流中提取链接")
        else:
            # 步骤1: 获取文章内容
            with st.container(border=True):
                st.subheader("步骤1: 获取文章内容")
                
                st.session_state.selected_link = st.selectbox(
                    "选择要获取的链接",
                    st.session_state.links,
                    index=0
                )
                
                fetch_col1, fetch_col2 = st.columns(2)
                with fetch_col1:
                    use_proxy = st.toggle("启用代理", value=st.session_state.use_proxy, key="use_proxy_toggle_2")
                    st.session_state.use_proxy = use_proxy
                with fetch_col2:
                    if st.button("获取文章内容", key="fetch_article", use_container_width=True) and st.session_state.selected_link:
                        with st.spinner("正在获取文章内容..."):
                            try:
                                module = load_blog_module(TEMP_DIR, st.session_state.blog_name)
                                
                                # 定义获取URL内容的函数
                                content = module.fetch_url(st.session_state.selected_link, use_proxy=st.session_state.use_proxy)
                                content_type = detect_content_type(content)
                                
                                if content:
                                    st.session_state.article_content = content
                                    st.session_state.article_content_type = content_type
                                    st.success(f"成功获取文章内容，类型: {content_type}")
                                else:
                                    st.error("获取文章内容失败")
                            except Exception as e:
                                st.error(f"获取文章内容出错: {str(e)}")
                
                if st.session_state.article_content:
                    with st.expander("查看获取的文章内容"):
                        view_type = st.radio(
                            "查看方式",
                            ["网页预览", "原始内容"],
                            horizontal=True
                        )
                        if view_type == "网页预览":
                            components.html(
                                st.session_state.article_content,
                                height=400,
                                scrolling=True
                            )
                        else:
                            st.text_area(
                                "原始内容",
                                st.session_state.article_content,
                                height=400,
                                disabled=True
                            )
            
            # 步骤2: 生成文章内容提取代码
            with st.container(border=True):
                st.subheader("步骤2: 生成文章内容提取代码")
                
                # 尝试默认加载已有代码
                if not st.session_state.article_code:
                    try:
                        code_path = Path(TEMP_DIR) / st.session_state.blog_name / "get_content.py"
                        if code_path.exists():
                            with open(code_path, "r", encoding="utf-8") as f:
                                st.session_state.article_code = f.read()
                            st.info("已自动加载已有代码")
                    except Exception as e:
                        pass  # 静默失败，不显示错误
                
                st.write(f"**内容类型:** {st.session_state.article_content_type}")
                
                button_col1, button_col2 = st.columns(2)
                with button_col1:
                    if st.button("生成代码", key="gen_article_code", use_container_width=True):
                        if st.session_state.article_content:
                            with st.spinner("正在生成代码..."):
                                try:
                                    article_code = gen_parse_article_code(
                                        compress_html(st.session_state.article_content) if st.session_state.article_content_type == "html" else st.session_state.article_content,
                                        content_type=st.session_state.article_content_type
                                    )
                                    
                                    if article_code:
                                        st.session_state.article_code = article_code
                                        st.success("成功生成文章内容提取代码")
                                        save_path = Path(TEMP_DIR) / st.session_state.blog_name / "get_content.py"
                                        save_code_to_temp(save_path, st.session_state.article_code)
                                        st.success(f"代码已自动保存到: {save_path}")
                                    else:
                                        st.error("生成代码失败")
                                except Exception as e:
                                    st.error(f"生成代码出错: {str(e)}")
                        else:
                            st.warning("请先获取文章内容")
                
                with button_col2:
                    if st.button("保存代码", key="save_article_code", use_container_width=True):
                        if st.session_state.article_code:
                            try:
                                save_path = Path(TEMP_DIR) / st.session_state.blog_name / "get_content.py"
                                save_code_to_temp(save_path, st.session_state.article_code)
                                st.success(f"代码已保存到: {save_path}")
                            except Exception as e:
                                st.error(f"保存代码出错: {str(e)}")
                        else:
                            st.warning("没有代码可保存")
                
                if st.session_state.article_code:
                    st.session_state.article_code = st.text_area("文章内容提取代码", st.session_state.article_code, height=300)
            
            # 步骤3: 批量处理所有选定的链接
            with st.container(border=True):
                st.subheader("步骤3: 批量处理所有选定的链接")
                
                delay = st.slider("请求间隔 (秒)", 1, 10, 5)

                if st.session_state.links:
                    # 创建一个多选框，让用户选择要处理的链接
                    st.session_state.selected_links = st.multiselect(
                        "选择要处理的链接 (可多选)",
                        st.session_state.links,
                        default=st.session_state.links[:min(3, len(st.session_state.links))]
                    )
                    
                    if st.session_state.selected_links:
                        st.write(f"**已选择 {len(st.session_state.selected_links)} 个链接**")
                    else:
                        st.warning("请至少选择一个链接")
                else:
                    st.warning("请先执行链接提取")
                
                button_col1, button_col2 = st.columns(2)
                with button_col1:
                    if st.button("批量处理", key="batch_process", use_container_width=True):
                        if st.session_state.article_code and st.session_state.selected_links:
                            with st.spinner("正在批量处理..."):
                                try:
                                    module = load_blog_module(TEMP_DIR, st.session_state.blog_name)
                                    articles = []
                                    
                                    progress_bar = st.progress(0)
                                    
                                    for i, url in enumerate(st.session_state.selected_links):
                                        st.write(f"处理 {i+1}/{len(st.session_state.selected_links)}: {url}")
                                        
                                        content = module.fetch_url(url, use_proxy=st.session_state.use_proxy)
                                        content_type = detect_content_type(content)
                                        
                                        if not content:
                                            articles.append({"error": "url未获取到内容", "url": url})
                                            continue
                                        
                                        article = run_code(st.session_state.article_code, "get_content", _content=content)
                                        article["url"] = url
                                        articles.append(article)
                                        
                                        progress_bar.progress((i + 1) / len(st.session_state.selected_links))
                                        
                                        if i < len(st.session_state.selected_links) - 1:
                                            time.sleep(delay)
                                    
                                    st.session_state.articles = articles
                                    st.success(f"成功处理 {len(articles)} 篇文章")
                                except Exception as e:
                                    st.error(f"批量处理出错: {str(e)}")
                        else:
                            st.warning("请先生成代码并选择链接")

                if len(st.session_state.articles) >= 1:
                    with st.expander("查看所有提取的文章内容", expanded=True):
                        st.write(f"**共提取 {len(st.session_state.articles)} 篇文章**")
                        st.json(st.session_state.articles)
                    
                    # 导出结果
                    export_col1, export_col2 = st.columns([3, 1])
                    with export_col2:
                        if st.button("导出结果为JSON", use_container_width=True):
                            if st.session_state.articles:
                                try:
                                    export_path = Path(TEMP_DIR) / st.session_state.blog_name / "articles.json"
                                    with open(export_path, "w", encoding="utf-8") as f:
                                        json.dump(st.session_state.articles, f, ensure_ascii=False, indent=2)
                                    st.success(f"结果已导出到: {export_path}")
                                except Exception as e:
                                    st.error(f"导出结果出错: {str(e)}")
                            else:
                                st.warning("没有结果可导出")