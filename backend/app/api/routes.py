from flask import jsonify, request
from app import db
from app.models import Todo
from app.api import bp


# 获取所有 TODOs
# 在 __init__.py 中注册了 /api 前缀，此处实际路径为 /api/todos
@bp.route("/todos", methods=["GET"])
def get_todos():
    todos = Todo.query.all()
    return jsonify([todo.to_dict() for todo in todos])


# 创建新 TODO
@bp.route("/todos", methods=["POST"])
def create_todo():
    data = request.get_json() or {}
    if "content" not in data:
        return jsonify({"error": "Content is required"}), 400

    todo = Todo(content=data["content"])
    db.session.add(todo)
    db.session.commit()
    return jsonify(todo.to_dict()), 201


# 更新 TODO
@bp.route("/todos/<int:id>", methods=["PUT"])
def update_todo(id):
    todo = Todo.query.get_or_404(id)
    data = request.get_json() or {}

    if "content" in data:
        todo.content = data["content"]
    if "completed" in data:
        todo.completed = data["completed"]

    db.session.commit()
    return jsonify(todo.to_dict())


# 删除 TODO
@bp.route("/todos/<int:id>", methods=["DELETE"])
def delete_todo(id):
    todo = Todo.query.get_or_404(id)
    db.session.delete(todo)
    db.session.commit()
    return jsonify({"message": "Todo deleted successfully"}), 200
