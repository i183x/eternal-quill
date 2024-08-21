import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc, collection, addDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import "./styles/PostView.css";

const PostView = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const docRef = doc(db, "posts", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPost(docSnap.data());
          setLikes(docSnap.data().likes || 0);
          fetchUserData(docSnap.data().authorId);
          fetchComments();
          checkIfLiked();
        } else {
          setError("Post not found");
        }
      } catch (error) {
        setError("Failed to load post: " + error.message);
      }
    };

    fetchPost();
  }, [id]);

  const fetchUserData = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        setUser(userDoc.data());
      } else {
        setError("Author not found");
      }
    } catch (error) {
      setError("Failed to load user data: " + error.message);
    }
  };

  const fetchComments = () => {
    const commentsRef = collection(db, "posts", id, "comments");
    onSnapshot(commentsRef, (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(commentsData);
    });
  };

  const checkIfLiked = async () => {
    try {
      const likeRef = doc(db, "posts", id, "likes", auth.currentUser.uid);
      const likeDoc = await getDoc(likeRef);
      setHasLiked(likeDoc.exists());
    } catch (error) {
      setError("Failed to check like status: " + error.message);
    }
  };

  const handleLike = async () => {
    if (hasLiked) {
      setError("You have already liked this post");
      return;
    }

    const postRef = doc(db, "posts", id);
    const likeRef = doc(db, "posts", id, "likes", auth.currentUser.uid);

    try {
      await setDoc(likeRef, { userId: auth.currentUser.uid });
      await updateDoc(postRef, {
        likes: likes + 1,
      });
      setLikes(likes + 1);
      setHasLiked(true);
    } catch (error) {
      setError("Failed to update likes: " + error.message);
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() === "") {
      setError("Comment cannot be empty");
      return;
    }

    try {
      const commentsRef = collection(db, "posts", id, "comments");
      await addDoc(commentsRef, {
        text: newComment,
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || "Anonymous",
        createdAt: new Date(),
      });
      setNewComment("");
    } catch (error) {
      setError("Failed to add comment: " + error.message);
    }
  };

  return (
    <div className="post-view-container">
      {error && <p className="error">{error}</p>}
      {post ? (
        <div className="post-content">
          <h2>{post.title}</h2>
          {user && (
            <p className="post-author">Written by: {user.username}</p>
          )}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
          <div className="post-actions">
            <button onClick={handleLike} disabled={hasLiked}>Like</button>
            <p>{likes} Likes</p>
          </div>
          <div className="post-comments">
            <h3>Comments ({comments.length})</h3>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength="2000"
              placeholder="Write your comment here..."
            />
            <button onClick={handleAddComment}>Add Comment</button>
            <ul>
              {comments.map((comment) => (
                <li key={comment.id}>
                  <p><strong>Anonymous:</strong> {comment.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p>Loading post...</p>
      )}
    </div>
  );
};

export default PostView;
