import React, { useState, useEffect } from "react";
import styles from "./Post.module.css";
import { db } from "../firebase";
import firebase from "firebase/app";
import { useAppSelector } from "../app/hooks";
import { selectUser } from "../features/userSlice";
import { Avatar, ThemeProvider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core";
import MessageIcon from "@material-ui/icons/Message";
import SendIcon from "@material-ui/icons/Send";

interface PROPS {
  avatar: string;
  image: string;
  postId: string;
  text: string;
  timestamp: any;
  username: string;
}

interface COMMENT {
  avatar: string;
  id: string;
  text: string;
  timestamp: any;
  username: string;
}

const useStyles = makeStyles((theme) => ({
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
}));

const Post: React.FC<PROPS> = (props) => {
  const classes = useStyles();
  const user = useAppSelector(selectUser);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<COMMENT[]>([
    {
      avatar: "",
      id: "",
      text: "",
      timestamp: null,
      username: "",
    },
  ]);
  const [openComments, setOpenComments] = useState(false);

  useEffect(() => {
    const unSub = db
      .collection("posts")
      .doc(props.postId)
      .collection("comments")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        setComments(
          snapshot.docs.map((doc) => ({
            avatar: doc.data().avatar,
            id: doc.id,
            text: doc.data().text,
            timestamp: doc.data().timestamp,
            username: doc.data().username,
          }))
        );
      });
    return () => {
      unSub();
    };
  }, [props.postId]);

  const newComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    db.collection("posts").doc(props.postId).collection("comments").add({
      avatar: user.photoUrl,
      text: comment,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      username: user.displayName,
    });
    setComment("");
  };

  return (
    <li className={styles.post}>
      <div className={styles.post_avatar}>
        <Avatar src={props.avatar} />
      </div>
      <div className={styles.post_body}>
        <div>
          <div className={styles.post_header}>
            <h3>
              <span className={styles.post_headerUser}>@{props.username}</span>
              <span className={styles.post_headerTime}>{new Date(props.timestamp?.toDate()).toLocaleString()}</span>
            </h3>
          </div>
          <div className={styles.post_tweet}>
            <p>{props.text}</p>
          </div>
        </div>
        {props.image && (
          <figure className={styles.post_tweetImage}>
            <img src={props.image} alt="tweet" />
          </figure>
        )}

        <MessageIcon className={styles.post_commentIcon} onClick={() => setOpenComments(!openComments)} />
        {openComments && (
          <ul>
            {comments.map((comment) => (
              <li key={comment.id} className={styles.post_comment}>
                <Avatar src={comment.avatar} className={classes.small} />
                <span className={styles.post_commentUser}>@{comment.username}</span>
                <span className={styles.post_commentText}>{comment.text}</span>
                <span className={styles.post_headerTime}>{new Date(comment.timestamp?.toDate()).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={newComment}>
          <div className={styles.post_form}>
            <input
              className={styles.post_input}
              type="text"
              placeholder="Type new comment"
              value={comment}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComment(e.target.value)}
            />
            <button
              disabled={!comment}
              className={comment ? styles.post_button : styles.post_buttonDisable}
              type="submit"
            >
              <SendIcon className={styles.post_sendIcon} />
            </button>
          </div>
        </form>
      </div>
    </li>
  );
};

export default Post;
