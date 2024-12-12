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

const generateAnonymousId = (userId: string) => {
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  return `Anonymous ${hashCode(userId) % 10000}`;
};

const Comments: React.FC<CommentsProps> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [repliesVisible, setRepliesVisible] = useState<{
    [key: string]: boolean;
  }>({});
  const [expandedComments, setExpandedComments] = useState<{
    [id: string]: boolean;
  }>({});
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

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

  const toggleReadMore = (commentId: string) => {
    setExpandedComments((prevState) => ({
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
      setError("You must be signed in to send a Kindword.");
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
      console.error("Error adding kindword:", error);
      setError("Failed to add kindword. Please try again.");
    }
  };

  const handleAddReply = async (commentId: string) => {
    const trimmedText = replyText[commentId]?.trim();
    if (!trimmedText) return;

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
          text: trimmedText,
          createdAt: serverTimestamp(),
        },
      );
      setReplyText((prev) => ({ ...prev, [commentId]: "" }));
    } catch (error) {
      console.error("Error adding reply:", error);
      alert("Failed to add reply. Please try again.");
    }
  };

  const fetchReplies = async (commentId: string) => {
    const repliesQuery = query(
      collection(db, "posts", postId, "comments", commentId, "replies"),
      orderBy("createdAt", "asc"),
    );

    const unsubscribe = onSnapshot(repliesQuery, (snapshot) => {
      const newReplies = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Reply[];
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? { ...comment, replies: newReplies }
            : comment,
        ),
      );
    });

    return unsubscribe;
  };

  useEffect(() => {
    comments.forEach((comment) => {
      if (repliesVisible[comment.id]) {
        fetchReplies(comment.id);
      }
    });
  }, [repliesVisible, comments]);

  return (
    <div className="mt-4 to-right">
      <h3 className="font-bold text-lg mb-2">Kindwords</h3>
      <ul className="mb-4">
        {comments.map((comment) => {
          const isExpanded = expandedComments[comment.id];
          const words = comment.text.split(" ");
          const shouldTruncate = words.length > 30;
          const anonymousUser = generateAnonymousId(comment.userId);

          return (
            <li key={comment.id} className="border-b pb-2 mb-2">
              <p className="text-gray-500 text-sm mb-1">
                {anonymousUser} says:
              </p>
              <p>
                {shouldTruncate && !isExpanded
                  ? `${words.slice(0, 30).join(" ")}...`
                  : comment.text}
                {shouldTruncate && (
                  <button
                    onClick={() => toggleReadMore(comment.id)}
                    className="text-blue-500 cursor-pointer ml-1 text-sm font-semibold hover:underline"
                  >
                    {isExpanded ? "Read Less" : "Read More"}
                  </button>
                )}
              </p>
              <small className="text-gray-500">
                {new Date(comment.createdAt?.toDate()).toLocaleString()}
              </small>
              <button
                onClick={() => toggleRepliesVisibility(comment.id)}
                className="text-blue-500 underline text-sm mt-1 show"
              >
                {repliesVisible[comment.id] ? "Hide Replies" : "Replies"}
              </button>
              {repliesVisible[comment.id] && comment.replies && (
                <div className="ml-4 mt-2">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="border-l pl-2 mb-2">
                      <p className="text-gray-500 text-sm">
                        {generateAnonymousId(reply.userId)} replied:
                      </p>
                      <p>{reply.text}</p>
                      <small className="text-gray-500">
                        {new Date(reply.createdAt?.toDate()).toLocaleString()}
                      </small>
                    </div>
                  ))}
                  <textarea
                    value={replyText[comment.id] || ""}
                    onChange={(e) =>
                      setReplyText((prev) => ({
                        ...prev,
                        [comment.id]: e.target.value,
                      }))
                    }
                    placeholder="Reply to this kindword..."
                    className="w-full border rounded p-2 mb-2"
                    rows={1}
                  />
                  <button
                    onClick={() => handleAddReply(comment.id)}
                    className="bg-blue-800 text-white px-3 py-1 rounded text-sm post-button"
                  >
                    Reply
                  </button>
                </div>
              )}
            </li>
          );
        })}
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

export default Comments;
