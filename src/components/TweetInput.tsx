import React from "react";
import styles from "./TweetInput.module.css";
import { useAppSelector } from "../app/hooks";
import { selectUser } from "../features/userSlice";
import { auth } from "../firebase";
import { Avatar } from "@material-ui/core";

const TweetInput = () => {
  const user = useAppSelector(selectUser);

  return (
    <div>
      <Avatar
        className={styles.tweet_avatar}
        src={user.photoUrl}
        onClick={async () => {
          await auth.signOut();
        }}
      />
      <p>{user.displayName}</p>
    </div>
  );
};

export default TweetInput;
