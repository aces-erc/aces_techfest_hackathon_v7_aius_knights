import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const AddPost: React.FC = () => {
  const [text, setText] = useState("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate post length
    const trimmedText = text.trim();
    if (!trimmedText) {
      setError("Post cannot be empty");
      return;
    }

    if (trimmedText.length < 10) {
      setError("Post must be at least 10 characters long");
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    try {
      setIsSubmitting(true);
      await addDoc(collection(db, "posts"), {
        userId: user.uid,
        text: trimmedText,
        createdAt: serverTimestamp(),
      });
      setText("");
      navigate("/");
    } catch (error) {
      setError("Error creating post. Please try again.");
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (error) setError(""); // Clear error when user starts typing
  };

  const remainingChars = text.trim().length;
  const isValidLength = remainingChars >= 10;

  return (
    <form onSubmit={handleSubmit} className="add-post p-4 mx-auto max-w-2xl">
      <h2 className="text-2xl font-bold mb-4 text-center">Share your Story</h2>
      <div className="relative">
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="What's on your mind? (minimum 10 characters)"
          className={`w-full p-2 mb-1 border rounded ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center mb-4">
          <span
            className={`text-sm ${
              remainingChars < 10 ? "text-red-500" : "text-gray-500"
            }`}
          >
            {remainingChars} / 10 characters minimum
          </span>
          {error && <span className="text-red-500 text-sm">{error}</span>}
        </div>
      </div>
      <button
        type="submit"
        disabled={!isValidLength || isSubmitting}
        className={`w-full px-4 py-2 rounded transition-colors ${
          isValidLength && !isSubmitting
            ? "bg-blue-500 hover:bg-blue-600 text-white"
            : "bg-gray-300 cursor-not-allowed text-gray-500"
        }`}
      >
        {isSubmitting ? "Posting..." : "Post"}
      </button>
    </form>
  );
};

export default AddPost;
