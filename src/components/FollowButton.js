import React, { useState, useEffect } from "react";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const FollowButton = ({ userId }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    checkIfFollowing();
  }, []);

  const checkIfFollowing = async () => {
    const user = auth.currentUser;
    if (user) {
      const followDocRef = doc(db, "users", user.uid, "following", userId);
      const followDoc = await getDoc(followDocRef);
      setIsFollowing(followDoc.exists());
    }
  };

  const handleFollow = async () => {
    const user = auth.currentUser;
    if (user) {
      const followDocRef = doc(db, "users", user.uid, "following", userId);
      await setDoc(followDocRef, { followedAt: new Date() });
      setIsFollowing(true);
    }
  };

  const handleUnfollow = async () => {
    const user = auth.currentUser;
    if (user) {
      const followDocRef = doc(db, "users", user.uid, "following", userId);
      await deleteDoc(followDocRef);
      setIsFollowing(false);
    }
  };

  return isFollowing ? (
    <button onClick={handleUnfollow}>Unfollow</button>
  ) : (
    <button onClick={handleFollow}>Follow</button>
  );
};

export default FollowButton;
