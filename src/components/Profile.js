import React, { useState, useEffect } from "react";
import { auth, db, storage } from "../firebase";
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate, useParams, Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import "./styles/Profile.css";

const Profile = () => {
  const { userId } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [introduction, setIntroduction] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [userPosts, setUserPosts] = useState([]);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [writeupsCount, setWriteupsCount] = useState(0);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchUserData(userId || user.uid);
        fetchUserStats(userId || user.uid);
        fetchUserPosts(userId || user.uid);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [userId, navigate]);

  const fetchUserData = async (uid) => {
    setLoadingProfile(true);
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
        setIntroduction(userDoc.data().introduction || "");
        setImageUrl(userDoc.data().profilePicUrl || "");
      } else {
        setError("User not found");
      }
    } catch (error) {
      setError("Error fetching user data: " + error.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchUserStats = async (uid) => {
    try {
      const followersQuerySnapshot = await getDocs(collection(db, "users", uid, "followers"));
      setFollowersCount(followersQuerySnapshot.size);

      const followingQuerySnapshot = await getDocs(collection(db, "users", uid, "following"));
      setFollowingCount(followingQuerySnapshot.size);

      const writeupsQuery = query(collection(db, "posts"), where("authorId", "==", uid));
      const writeupsQuerySnapshot = await getDocs(writeupsQuery);
      setWriteupsCount(writeupsQuerySnapshot.size);
    } catch (error) {
      setError("Error fetching user stats: " + error.message);
    }
  };

  const fetchUserPosts = async (uid) => {
    setLoadingPosts(true);
    try {
      const postsQuery = query(collection(db, "posts"), where("authorId", "==", uid));
      const querySnapshot = await getDocs(postsQuery);
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserPosts(postsData);
    } catch (error) {
      setError("Failed to load user posts: " + error.message);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleSaveProfile = async () => {
    if (savingProfile) return;

    const user = currentUser;
    if (user) {
      setSavingProfile(true);
      try {
        let profilePicUrl = imageUrl;
        if (profilePic) {
          const profilePicRef = ref(storage, `profilePics/${user.uid}`);
          await uploadBytes(profilePicRef, profilePic);
          profilePicUrl = await getDownloadURL(profilePicRef);
        }

        await updateDoc(doc(db, "users", user.uid), {
          introduction,
          profilePicUrl,
        });

        setIsEditing(false);
        setError("Profile updated successfully!");
      } catch (error) {
        setError("Error updating profile: " + error.message);
      } finally {
        setSavingProfile(false);
      }
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 250 * 1024) {
      setProfilePic(file);
    } else {
      setError("Profile picture must be less than 250KB");
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, "posts", postId));
      setUserPosts(userPosts.filter(post => post.id !== postId));
      setWriteupsCount(writeupsCount - 1);
    } catch (error) {
      setError("Error deleting post: " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      setError("Error logging out: " + error.message);
    }
  };

  return (
    <div className="profile-container">
      <h2>{userId ? `${userData?.username}'s Profile` : "Your Profile"}</h2>
      {error && <p className="error">{error}</p>}
      {loadingProfile ? (
        <p>Loading profile...</p>
      ) : userData ? (
        <div className="profile-content">
          <div className="profile-image">
            {imageUrl && <img src={imageUrl} alt="Profile" />}
          </div>
          <div className="profile-details">
            <p><strong>Introduction:</strong> {introduction}</p>
            {userId && userId === currentUser?.uid && (
              <>
                {isEditing ? (
                  <>
                    <textarea
                      value={introduction}
                      onChange={(e) => setIntroduction(e.target.value)}
                      maxLength="750"
                      rows="4"
                    />
                    <input type="file" onChange={handleProfilePicChange} />
                    <button onClick={handleSaveProfile} disabled={savingProfile}>
                      {savingProfile ? "Saving..." : "Save Profile"}
                    </button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)}>Edit Profile</button>
                )}
              </>
            )}
            {!userId && <button onClick={handleLogout}>Sign Out</button>}
          </div>
          <div className="user-stats">
            <p><strong>Total Writeups:</strong> {writeupsCount}</p>
            <p><strong>Following:</strong> {followingCount}</p>
            <p><strong>Followers:</strong> {followersCount}</p>
          </div>
          <div className="user-posts">
            <h3>Your Posts</h3>
            {loadingPosts ? (
              <p>Loading posts...</p>
            ) : userPosts.length > 0 ? (
              <ul>
                {userPosts.map((post) => (
                  <li key={post.id}>
                    <h4>{post.title}</h4>
                    <p>{post.content.substring(0, 200)}...</p>
                    <Link to={`/posts/${post.id}`}>
                      <button>Read More</button>
                    </Link>
                    {(!userId || userId === currentUser?.uid) && (
                      <button onClick={() => handleDeletePost(post.id)}>Delete</button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No posts available.</p>
            )}
          </div>
        </div>
      ) : (
        <p>User not found</p>
      )}
    </div>
  );
};

export default Profile;
