import { useState, useEffect } from "react";
import "./App.css";

// 使用环境变量管理API地址
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
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

  const handleAdd = async () => {
    if (!input.trim()) return;
    const res = await fetch(`${API_BASE_URL}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input }),
    });
    if (res.ok) {
      const newTodo = await res.json();
      setTodos([...todos, newTodo]);
      setInput("");
    }
  };

  const handleToggle = async (id) => {
    const res = await fetch(`${API_BASE_URL}/todos/${id}`, { method: "PUT" });
    if (res.ok) {
      const updated = await res.json();
      setTodos(todos.map((t) => (t.id === id ? updated : t)));
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setTodos(todos.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="container">
      <h1>My Todo List</h1>
      <div className="input-group">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What needs to be done?"
          onKeyPress={(e) => e.key === "Enter" && handleAdd()}
        />
        <button onClick={handleAdd}>Add</button>
      </div>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} className={todo.completed ? "completed" : ""}>
            <span
              onClick={() => handleToggle(todo.id)}
              style={{ cursor: "pointer", flex: 1 }}
            >
              {todo.content}
            </span>
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
