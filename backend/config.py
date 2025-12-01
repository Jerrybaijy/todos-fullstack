import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()


class Config:
    # Flask 配置
    SECRET_KEY = os.environ.get("SECRET_KEY") or "your-secret-key"

    # 获取数据库连接信息
    DB_USER = os.environ.get("MYSQL_USER") or "root"
    DB_PASS = os.environ.get("MYSQL_PASSWORD") or "password"
    DB_HOST = os.environ.get("DB_HOST") or "localhost"
    DB_NAME = os.environ.get("MYSQL_DATABASE") or "todos_db"

    # SQLAlchemy 配置
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}?charset=utf8mb4"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
