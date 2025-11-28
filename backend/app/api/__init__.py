from flask import Blueprint

# 创建 API 蓝图
bp = Blueprint('api', __name__)

# 导入路由
from app.api import routes