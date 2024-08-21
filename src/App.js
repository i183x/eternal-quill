import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Navbar from "./components/Navbar";
import Profile from "./components/Profile";
import Users from "./components/Users";
import Write from "./components/Write";
import PostView from "./components/PostView";
import Feed from "./components/Feed"; 
import Competitions from "./components/Competitions";
import TermsAndConditions from "./components/TermsAndConditions";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Feed />} /> 
        <Route path="/posts/:id" element={<PostView />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        
        <Route
          path="/profile/:userId"
          element={<PrivateRoute element={Profile} />}
        />
        <Route
          path="/profile"
          element={<PrivateRoute element={Profile} />}
        />
        <Route
          path="/write"
          element={<PrivateRoute element={Write} />}
        />
        <Route
          path="/competitions"
          element={<PrivateRoute element={Competitions} />}
        />
        <Route
          path="/users"
          element={<PrivateRoute element={Users} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
