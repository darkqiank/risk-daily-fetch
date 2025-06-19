import hashlib
from typing import Dict, Any
import httpx

def hash_data(data: str) -> str:
    return hashlib.sha256(data.encode('utf-8')).hexdigest()

