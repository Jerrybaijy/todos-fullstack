from app import db


# 数据库模型
class Todo(db.Model):
    # 表名
    __tablename__ = "todos"

    # 主键
    id = db.Column(db.Integer, primary_key=True)
    # TODO 内容
    content = db.Column(db.String(200), nullable=False)
    # 完成状态
    completed = db.Column(db.Boolean, default=False)

    def to_dict(self):
        # 转换为字典格式，用于 API 返回
        return {"id": self.id, "content": self.content, "completed": self.completed}
