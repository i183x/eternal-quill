import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Link } from "react-router-dom";
import "./styles/Users.css";
import FollowButton from "./FollowButton";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCurrentUser = () => {
      const user = auth.currentUser;
      if (user) {
        setCurrentUser(user);
      }
    };

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersQuery = query(
          collection(db, "users"),
          orderBy("lastLoginAt", "desc"),
          limit(50)
        );

        const querySnapshot = await getDocs(usersQuery);
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsers(usersData);
      } catch (error) {
        setError("Failed to load users: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
    fetchUsers();
  }, []);

  return (
    <div className="users-container">
      <h2>Recently Active Users</h2>
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading users...</p>
      ) : users.length > 0 ? (
        <ul className="user-list">
          {users.map((user) => (
            <li key={user.id}>
              <Link to={`/profile/${user.id}`} className="user-link">
                <img 
                  src={user.profilePicUrl} 
                  alt={`${user.username}'s profile`} 
                  className="user-profile-pic"
                />
                <span>{user.username}</span>
              </Link>
              {currentUser && currentUser.uid !== user.id && (
                <FollowButton userId={user.id} />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No users available.</p>
      )}
    </div>
  );
};

export default Users;
