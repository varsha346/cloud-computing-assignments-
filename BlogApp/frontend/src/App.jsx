import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [myPosts, setMyPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [authMode, setAuthMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const authHeaders = useMemo(
    () => ({ headers: { authorization: token } }),
    [token]
  );

  const fetchMyPosts = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API}/posts`, authHeaders);
      setMyPosts(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to fetch posts");
    }
  };

  const fetchAllPosts = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API}/posts/all`, authHeaders);
      setAllPosts(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to fetch dashboard posts");
    }
  };

  const handleAuth = async () => {
    setMessage("");
    try {
      if (authMode === "register") {
        await axios.post(`${API}/auth/register`, { name, email, password });
        setAuthMode("login");
        setMessage("Registration successful. Please login.");
        return;
      }

      const res = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setPassword("");
      setMessage("Login successful");
    } catch (err) {
      setMessage(err.response?.data?.message || err.response?.data?.error || "Auth failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setMyPosts([]);
    setAllPosts([]);
    setMessage("Logged out");
  };

  const savePost = async () => {
    if (!title.trim() || !content.trim()) return;

    try {
      if (editingId) {
        await axios.put(
          `${API}/posts/${editingId}`,
          { title, content },
          authHeaders
        );
        setMessage("Post updated");
      } else {
        await axios.post(`${API}/posts`, { title, content }, authHeaders);
        setMessage("Post created");
      }

      setTitle("");
      setContent("");
      setEditingId(null);
      fetchMyPosts();
      fetchAllPosts();
    } catch (err) {
      setMessage(err.response?.data?.message || err.response?.data?.error || "Save failed");
    }
  };

  const startEdit = (post) => {
    setEditingId(post.id);
    setTitle(post.title || "");
    setContent(post.content || "");
  };

  const deletePost = async (id) => {
    try {
      await axios.delete(`${API}/posts/${id}`, authHeaders);
      setMessage("Post deleted");
      fetchMyPosts();
      fetchAllPosts();
    } catch (err) {
      setMessage(
        err.response?.data?.message || err.response?.data?.error || "Delete failed"
      );
    }
  };

  useEffect(() => {
    fetchMyPosts();
    fetchAllPosts();
  }, [token]);

  return (
    <div className="app">
      <h1>Bogify</h1>
      <p className="hint">Connected to auth and post routes from your backend.</p>
      {message && <p className="message">{message}</p>}

      {!token ? (
        <section className="card">
          <h2>{authMode === "register" ? "Register" : "Login"}</h2>

          {authMode === "register" && (
            <input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleAuth}>
            {authMode === "register" ? "Create Account" : "Login"}
          </button>

          <button
            className="secondary"
            onClick={() => setAuthMode(authMode === "register" ? "login" : "register")}
          >
            {authMode === "register"
              ? "Already have an account? Login"
              : "Need an account? Register"}
          </button>
        </section>
      ) : (
        <>
          <section className="card nav-card">
            <div className="row nav-row">
              <button
                className={activePage === "dashboard" ? "active" : "secondary"}
                onClick={() => setActivePage("dashboard")}
              >
                Dashboard
              </button>
              <button
                className={activePage === "mine" ? "active" : "secondary"}
                onClick={() => setActivePage("mine")}
              >
                Your Posts
              </button>
              <button className="danger" onClick={logout}>
                Logout
              </button>
            </div>
          </section>

          {activePage === "dashboard" ? (
            <section className="list">
              <h2>Dashboard - All Posts</h2>
              {allPosts.length === 0 && <p>No posts available.</p>}
              {allPosts.map((post) => (
                <article key={post.id} className="post">
                  <h3>{post.title}</h3>
                  <p>{post.content}</p>
                  <p className="meta">
                    By: {post.User?.name || "Unknown"} ({post.User?.email || "no email"})
                  </p>
                </article>
              ))}
            </section>
          ) : (
            <>
              <section className="card">
                <h2>{editingId ? "Edit Post" : "Create Post"}</h2>
                <input
                  placeholder="Post title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                  placeholder="Post content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <div className="row">
                  <button onClick={savePost}>{editingId ? "Update" : "Create"}</button>
                  {editingId && (
                    <button
                      className="secondary"
                      onClick={() => {
                        setEditingId(null);
                        setTitle("");
                        setContent("");
                      }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </section>

              <section className="list">
                <h2>Your Posts</h2>
                {myPosts.length === 0 && <p>No posts yet.</p>}
                {myPosts.map((post) => (
                  <article key={post.id} className="post">
                    <h3>{post.title}</h3>
                    <p>{post.content}</p>
                    <div className="row">
                      <button className="secondary" onClick={() => startEdit(post)}>
                        Edit
                      </button>
                      <button className="danger" onClick={() => deletePost(post.id)}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;