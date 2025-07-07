import dotenv
import os
from prefect.filesystems import LocalFileSystem
from pathlib import Path
# 获取当前文件所在目录
current_dir = Path(__file__).parent.resolve()
cache_storage_dir = current_dir / ".cache"
cache_storage_dir.mkdir(exist_ok=True)
dotenv.load_dotenv()


local_cache_storage = LocalFileSystem(
    basepath=f"{cache_storage_dir}",
)

def get_or_create_local_block(block_name="risk-local-storage"):
    try:
        # 检查块是否已存在
        return local_cache_storage.load(block_name)
    except ValueError:
        # 如果不存在，创建并保存
        local_cache_storage.save("risk-local-storage", overwrite=True)  # 保存并命名存储配置
        return local_cache_storage.load(block_name)

# 初始化 本地缓存块（仅首次时创建）
local_block = get_or_create_local_block()
print(f"缓存地址: {local_block.basepath}")