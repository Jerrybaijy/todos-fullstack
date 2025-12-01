import { useState, useEffect } from "react";
import "./App.css";

// 允许使用环境变量管理 API 地址，默认值为"/api"
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

/**
 * Todo列表应用的主组件
 * 实现了Todo的增删改查功能
 */
function App() {
  // todos状态：存储所有Todo项的数据
  const [todos, setTodos] = useState([]);
  // input状态：存储用户输入的新Todo内容
  const [input, setInput] = useState("");

  // 组件挂载时，从API获取初始Todo列表
  useEffect(() => {
    // 在effect中直接定义异步函数并执行
    const fetchInitialTodos = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/todos`);
        if (res.ok) {
          const data = await res.json();
          setTodos(data);
        }
      } catch (error) {
        console.error("Failed to fetch todos", error);
      }
    };

    fetchInitialTodos();
  }, []);

  // 添加新的Todo项
  const handleAdd = async () => {
    // 验证输入不为空
    if (!input.trim()) return;

    // 发送POST请求添加Todo
    const res = await fetch(`${API_BASE_URL}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input }),
    });

    // 添加成功后更新状态
    if (res.ok) {
      const newTodo = await res.json();
      setTodos([...todos, newTodo]);
      setInput(""); // 清空输入框
    }
  };

  // 切换Todo项的完成状态
  const handleToggle = async (id) => {
    // 发送PUT请求切换完成状态
    const res = await fetch(`${API_BASE_URL}/todos/${id}`, { method: "PUT" });

    // 更新成功后更新状态
    if (res.ok) {
      const updated = await res.json();
      setTodos(todos.map((t) => (t.id === id ? updated : t)));
    }
  };

  // 删除指定ID的Todo项
  const handleDelete = async (id) => {
    // 发送DELETE请求删除Todo
    const res = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: "DELETE",
    });

    // 删除成功后更新状态
    if (res.ok) {
      setTodos(todos.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="container">
      <h1>My Todo List</h1>

      {/* 输入区域：添加新Todo */}
      <div className="input-group">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What needs to be done?"
          onKeyPress={(e) => e.key === "Enter" && handleAdd()}
        />
        <button onClick={handleAdd}>Add</button>
      </div>

      {/* Todo列表展示 */}
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} className={todo.completed ? "completed" : ""}>
            {/* Todo内容，点击可切换完成状态 */}
            <span
              onClick={() => handleToggle(todo.id)}
              style={{ cursor: "pointer", flex: 1 }}
            >
              {todo.content}
            </span>
            {/* 删除按钮 */}
            <button
              className="delete-btn"
              onClick={() => handleDelete(todo.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
