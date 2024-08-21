import React, { useState } from "react";
import { auth, db } from "../firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import styles for react-quill
import "./styles/Write.css";

const Write = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handlePost = async () => {
    const user = auth.currentUser;
    if (!title || !content) {
      setError("Both title and content are required.");
      return;
    }

    if (content.length > 20000) {
      setError("Content must not exceed 20,000 characters.");
      return;
    }

    try {
      const postRef = collection(db, "posts");
      await addDoc(postRef, {
        title,
        content,
        authorId: user.uid,
        createdAt: Timestamp.now(),
      });

      navigate("/"); // Redirect to the feed after posting
      window.location.reload(); // Force a page reload to refresh the content
    } catch (error) {
      setError("Error posting your write-up: " + error.message);
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
      <button onClick={handlePost}>Post Write-Up</button>
    </div>
  );
};

export default Write;
