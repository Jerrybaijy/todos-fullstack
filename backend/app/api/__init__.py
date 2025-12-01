from flask import Blueprint

# 创建 API 蓝图
# 注册了 /api 前缀，即 routes.py 中的 /todos 实际路径为 /api/todos
bp = Blueprint('api', __name__)

# 导入路由
from app.api import routes