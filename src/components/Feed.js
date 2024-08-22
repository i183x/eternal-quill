import React, { useState, useEffect, useCallback } from "react";
import { collection, query, where, orderBy, startAfter, getDocs, Timestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import "./styles/Feed.css";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [lastPost, setLastPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false); 
  const [loadedFollowingPosts, setLoadedFollowingPosts] = useState(false); 

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 200
    ) {
      loadMorePosts();
    }
  }, [lastPost, hasMore, loading, isFollowing, loadedFollowingPosts]);

  useEffect(() => {
    loadInitialPosts();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const loadInitialPosts = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const oneWeekAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
      let postsQuery;

      if (user) {
        // Check if user is following anyone
        const followingRef = collection(db, "users", user.uid, "following");
        const followingSnapshot = await getDocs(followingRef);
        const followedUsers = followingSnapshot.docs.map((doc) => doc.id);

        if (followedUsers.length > 0) {
          setIsFollowing(true);
          // Fetch posts from the last week from followed users
          postsQuery = query(
            collection(db, "posts"),
            where("authorId", "in", followedUsers),
            where("createdAt", ">=", oneWeekAgo),
            orderBy("createdAt", "desc")
          );
        }
      }

      if (!postsQuery || !isFollowing) {
        // If not following anyone or no posts from followed users, fetch recent posts
        postsQuery = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc")
        );
        setLoadedFollowingPosts(true); // Set this to true so that recent posts are loaded after following posts are exhausted
      }

      const querySnapshot = await getDocs(postsQuery);
      const newPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPosts(newPosts);
      setLastPost(querySnapshot.docs[querySnapshot.docs.length - 1]);

      if (newPosts.length === 0 || !isFollowing) {
        setHasMore(false);
      }
    } catch (error) {
      setError("Failed to load posts: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      let postsQuery;

      if (isFollowing && !loadedFollowingPosts) {
        // Fetch more posts from followed users (if any are still available)
        const user = auth.currentUser;
        const oneWeekAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
        const followingRef = collection(db, "users", user.uid, "following");
        const followingSnapshot = await getDocs(followingRef);
        const followedUsers = followingSnapshot.docs.map((doc) => doc.id);

        if (followedUsers.length > 0) {
          postsQuery = query(
            collection(db, "posts"),
            where("authorId", "in", followedUsers),
            where("createdAt", ">=", oneWeekAgo),
            orderBy("createdAt", "desc"),
            startAfter(lastPost)
          );
        }

        const querySnapshot = await getDocs(postsQuery);
        const newPosts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPosts((prevPosts) => [...prevPosts, ...newPosts]);
        setLastPost(querySnapshot.docs[querySnapshot.docs.length - 1]);

        if (newPosts.length === 0) {
          setLoadedFollowingPosts(true); // Finished loading followed users' posts, start loading recent posts
          setLastPost(null); // Reset last post for the next phase
        }

      } else {
        // Load recent posts after loading followed users' posts
        postsQuery = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc"),
          startAfter(lastPost)
        );

        const querySnapshot = await getDocs(postsQuery);
        const newPosts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (newPosts.length === 0) {
          setHasMore(false);
        }

        setPosts((prevPosts) => [...prevPosts, ...newPosts]);
        setLastPost(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }
    } catch (error) {
      setError("Failed to load posts: " + error.message);
    } finally {
      setLoading(false);
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
