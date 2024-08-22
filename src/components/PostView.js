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
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [addingComment, setAddingComment] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    setLoadingPost(true);
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
    } finally {
      setLoadingPost(false);
    }
  };

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
    setLoadingComments(true);
    const commentsRef = collection(db, "posts", id, "comments");
    onSnapshot(commentsRef, (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(commentsData);
      setLoadingComments(false);
    }, (error) => {
      setError("Failed to load comments: " + error.message);
      setLoadingComments(false);
    });
  };

  const checkIfLiked = async () => {
    if (!auth.currentUser) return;

    try {
      const likeRef = doc(db, "posts", id, "likes", auth.currentUser.uid);
      const likeDoc = await getDoc(likeRef);
      setHasLiked(likeDoc.exists());
    } catch (error) {
      setError("Failed to check like status: " + error.message);
    }
  };

  const handleLike = async () => {
    if (!auth.currentUser) {
      setError("You must be logged in to like a post.");
      return;
    }

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
    if (!auth.currentUser) {
      setError("You must be logged in to comment.");
      return;
    }

    if (newComment.trim() === "") {
      setError("Comment cannot be empty");
      return;
    }

    setAddingComment(true);
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
    } finally {
      setAddingComment(false);
    }
  };

  return (
    <div className="post-view-container">
      {error && <p className="error">{error}</p>}
      {loadingPost ? (
        <p>Loading post...</p>
      ) : post ? (
        <div className="post-content">
          <h2>{post.title}</h2>
          {user && (
            <p className="post-author">Written by: {user.username}</p>
          )}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
          <div className="post-actions">
            <button onClick={handleLike} disabled={hasLiked}>
              {hasLiked ? "Liked" : "Like"}
            </button>
            <p>{likes} Likes</p>
          </div>
          <div className="post-comments">
            <h3>Comments ({comments.length})</h3>
            {loadingComments ? (
              <p>Loading comments...</p>
            ) : (
              <>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  maxLength="2000"
                  placeholder="Write your comment here..."
                  disabled={addingComment}
                />
                <button onClick={handleAddComment} disabled={addingComment}>
                  {addingComment ? "Adding Comment..." : "Add Comment"}
                </button>
                <ul>
                  {comments.map((comment) => (
                    <li key={comment.id}>
                      <p><strong>{comment.authorName}:</strong> {comment.text}</p>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      ) : (
        <p>Post not found.</p>
      )}
    </div>
  );
};

export default PostView;
