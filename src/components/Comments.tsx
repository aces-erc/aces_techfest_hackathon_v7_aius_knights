import React, { useState, useEffect } from "react";
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
  createdAt: any; // Firestore timestamp
}

interface CommentsProps {
  postId: string;
}

const Comments: React.FC<CommentsProps> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

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

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedText = text.trim();
    if (!trimmedText) {
      setError("Comment cannot be empty");
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

  return (
    <div className="mt-4">
      <h3 className="font-bold text-lg mb-2">Comments</h3>
      <ul className="mb-4">
        {comments.map((comment) => (
          <li key={comment.id} className="border-b pb-2 mb-2">
            <p>{comment.text}</p>
            <small className="text-gray-500">
              {new Date(comment.createdAt?.toDate()).toLocaleString()}
            </small>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAddComment} className="mt-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="w-full border rounded p-2 mb-2"
          rows={1}
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Comment
        </button>
      </form>
    </div>
  );
};

export default Comments;
