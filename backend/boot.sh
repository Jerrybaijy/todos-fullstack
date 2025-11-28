#!/bin/bash

# 等待数据库可用
echo "Waiting for database..."
while ! nc -z $DB_HOST 3306; do
  sleep 1
done
echo "Database is ready!"

# 执行数据库迁移
flask db upgrade

# 启动应用
gunicorn -b 0.0.0.0:5000 run:app