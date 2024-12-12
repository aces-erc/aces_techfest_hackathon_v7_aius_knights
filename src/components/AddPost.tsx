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
    if (error) setError("");
  };

  const remainingChars = text.trim().length;
  const isValidLength = remainingChars >= 10;

  return (
    <div className="min-h-screen bg-blue-110 p-6">
      <div className="max-w-3xl mx-auto rounded-lg p-6 bg-white m-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Share your Story
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <textarea
              value={text}
              onChange={handleTextChange}
              placeholder="What's on your mind? (minimum 10 characters)"
              className={`w-full p-3 h-28 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isSubmitting}
            />
          </div>
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
      </div>
    </div>
  );
};

export default AddPost;
