import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Link } from "react-router-dom";
import "./styles/Users.css";
import FollowButton from "./FollowButton";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
    setCurrentUser(auth.currentUser);
  }, []);

  const fetchUsers = async () => {
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
    }
  };

  return (
    <div className="users-container">
      <h2>Recently Active Users</h2>
      {error && <p className="error">{error}</p>}
      {users.length > 0 ? (
        <ul className="user-list">
          {users.map((user) => (
            <li key={user.id}>
              <Link to={`/profile/${user.id}`}>
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
