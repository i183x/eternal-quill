import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./styles/Write.css";

const Write = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
    }
  }, [navigate]);

  const handlePost = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError("You must be logged in to create a post.");
      return;
    }

    if (!title || title.length > 100) {
      setError("Title is required and must not exceed 100 characters.");
      return;
    }

    if (!content || content.length > 20000) {
      setError("Content is required and must not exceed 20,000 characters.");
      return;
    }

    setLoading(true);
    try {
      const postRef = collection(db, "posts");
      await addDoc(postRef, {
        title,
        content,
        authorId: user.uid,
        createdAt: Timestamp.now(),
      });

      setTitle("");
      setContent("");
      navigate("/"); // Redirect to the feed after posting
    } catch (error) {
      setError("Error posting your write-up: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="write-container">
      <h2>Create a Write-Up</h2>
      {error && <p className="error">{error}</p>}
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength="100"
      />
      <ReactQuill
        value={content}
        onChange={setContent}
        placeholder="Write your content here..."
      />
      <button onClick={handlePost} disabled={loading}>
        {loading ? "Posting..." : "Post Write-Up"}
      </button>
    </div>
  );
};

export default Write;
