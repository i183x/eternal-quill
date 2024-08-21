import React, { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, startAfter, getDocs, Timestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import "./styles/Feed.css";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [lastPost, setLastPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    loadInitialPosts();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadInitialPosts = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const oneWeekAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // Timestamp for one week ago
      let postsQuery;

      if (user) {
        // Step 1: Get posts from the past week by followed users
        const followingRef = collection(db, "users", user.uid, "following");
        const followingSnapshot = await getDocs(followingRef);
        const followedUsers = followingSnapshot.docs.map((doc) => doc.id);

        if (followedUsers.length > 0) {
          postsQuery = query(
            collection(db, "posts"),
            where("authorId", "in", followedUsers),
            where("createdAt", ">=", oneWeekAgo),
            orderBy("createdAt", "desc"),
            limit(5)
          );
        }
      }

      if (!postsQuery) {
        // Step 2: If no followed users or no posts from followed users, fetch recent posts
        postsQuery = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc"),
          limit(5)
        );
      }

      const querySnapshot = await getDocs(postsQuery);
      const newPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPosts(newPosts);
      setLastPost(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setInitialLoadComplete(true);

      if (newPosts.length < 5) {
        setHasMore(false);
      }
    } catch (error) {
      setError("Failed to load posts: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (loading || !hasMore || !initialLoadComplete) return;

    setLoading(true);
    try {
      let postsQuery = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        startAfter(lastPost),
        limit(5)
      );

      const querySnapshot = await getDocs(postsQuery);
      const newPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (newPosts.length < 5) {
        setHasMore(false); // No more posts to load
      }

      setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      setLastPost(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } catch (error) {
      setError("Failed to load posts: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 200
    ) {
      loadMorePosts();
    }
  };

  return (
    <div className="feed-container">
      <h2>Recent Posts</h2>
      {error && <p className="error">{error}</p>}
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.id} className="post">
            <h3>{post.title}</h3>
            <p>{post.content.substring(0, 300)}...</p>
            <button onClick={() => window.location.href = `/posts/${post.id}`}>Read More</button>
          </div>
        ))
      ) : (
        <p>No posts available.</p>
      )}
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default Feed;
