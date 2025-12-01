from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config

# 创建数据库实例
db = SQLAlchemy()
# 创建迁移实例
migrate = Migrate()
# 创建 CORS 实例，使用 flask-cors 库启用了跨域资源共享，允许前端跨域请求
cors = CORS()


def create_app(config_class=Config):
    # 创建 Flask 应用
    app = Flask(__name__)
    # 加载配置
    app.config.from_object(config_class)

    # 初始化数据库
    db.init_app(app)
    # 初始化迁移
    migrate.init_app(app, db)
    # 初始化CORS
    cors.init_app(app)

    # 导入模型，确保SQLAlchemy知道所有模型
    from app import models

    # 注册蓝图
    from app.api import bp as api_bp

    app.register_blueprint(api_bp, url_prefix="/api")

    return app
