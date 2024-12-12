import React, { useState, useEffect } from "react";
import "../App.css";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";

interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: any;
}

interface Reply extends Comment {}

interface CommentsProps {
  postId: string;
}

const Comments: React.FC<CommentsProps> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [repliesVisible, setRepliesVisible] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const commentsQuery = query(
      collection(db, "posts", postId, "comments"),
      orderBy("createdAt", "asc"),
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const newComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];
      setComments(newComments);
    });

    return () => unsubscribe();
  }, [postId]);

  const toggleRepliesVisibility = (commentId: string) => {
    setRepliesVisible((prevState) => ({
      ...prevState,
      [commentId]: !prevState[commentId],
    }));
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedText = text.trim();
    if (!trimmedText) {
      setError("Kindword cannot be empty");
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setError("You must be signed in to comment.");
      return;
    }

    try {
      await addDoc(collection(db, "posts", postId, "comments"), {
        userId: user.uid,
        text: trimmedText,
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Failed to add comment. Please try again.");
    }
  };

  const handleAddReply = async (commentId: string, replyText: string) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("You must be signed in to reply.");
      return;
    }

    try {
      await addDoc(
        collection(db, "posts", postId, "comments", commentId, "replies"),
        {
          userId: user.uid,
          text: replyText,
          createdAt: serverTimestamp(),
        },
      );
    } catch (error) {
      console.error("Error adding reply:", error);
      alert("Failed to add reply. Please try again.");
    }
  };

  return (
    <div className="mt-4">
      <h3 className="font-bold text-lg mb-2">Kindwords</h3>
      <ul className="mb-4">
        {comments.map((comment) => (
          <li key={comment.id} className="border-b pb-2 mb-2">
            <p>{comment.text}</p>
            <small className="text-gray-500">
              {new Date(comment.createdAt?.toDate()).toLocaleString()}
            </small>
            <button
              onClick={() => toggleRepliesVisibility(comment.id)}
              className="text-blue-500 underline text-sm mt-1 show"
            >
              {repliesVisible[comment.id] ? "Hide Replies" : "Show Replies"}
            </button>
            {repliesVisible[comment.id] && (
              <Replies
                postId={postId}
                commentId={comment.id}
                onReply={(replyText) => handleAddReply(comment.id, replyText)}
              />
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={handleAddComment} className="mt-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a kindword..."
          className="w-full border rounded p-2 mb-2"
          rows={1}
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded post-button"
        >
          Add Kindword
        </button>
      </form>
    </div>
  );
};

const Replies: React.FC<{
  postId: string;
  commentId: string;
  onReply: (replyText: string) => void;
}> = ({ postId, commentId, onReply }) => {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const repliesQuery = query(
      collection(db, "posts", postId, "comments", commentId, "replies"),
      orderBy("createdAt", "asc"),
    );

    const unsubscribe = onSnapshot(repliesQuery, (snapshot) => {
      const newReplies = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Reply[];
      setReplies(newReplies);
    });

    return () => unsubscribe();
  }, [postId, commentId]);

  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedText = replyText.trim();
    if (!trimmedText) return;
    onReply(trimmedText);
    setReplyText("");
  };

  return (
    <div className="ml-4 mt-2">
      {replies.map((reply) => (
        <div key={reply.id} className="border-l pl-2 mb-2">
          <p>{reply.text}</p>
          <small className="text-gray-500">
            {new Date(reply.createdAt?.toDate()).toLocaleString()}
          </small>
        </div>
      ))}
      <form onSubmit={handleAddReply}>
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Reply to this kindword..."
          className="w-full border rounded p-2 mb-2"
          rows={1}
        />
        <button
          type="submit"
          className="bg-blue-400 text-white px-3 py-1 rounded text-sm post-button"
        >
          Reply
        </button>
      </form>
    </div>
  );
};

export default Comments;
