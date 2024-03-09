import React, { FC } from "react";
import { Link } from "react-router-dom";
import "./userProfile.css";

interface UserProfileProps {}

export const UserProfile: FC<UserProfileProps> = ({}) => {
  return (
    <div className="profile">
      <Link to={"/login"}>Login</Link>
    </div>
  );
};
