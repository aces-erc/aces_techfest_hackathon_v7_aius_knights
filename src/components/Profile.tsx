import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { Link, useNavigate } from "react-router-dom";

interface Post {
  id: string;
  text: string;
  imageUrl?: string;
}

const Profile: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const [expandedPosts, setExpandedPosts] = useState<{ [id: string]: boolean }>(
    {},
  );

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const postsQuery = query(
          collection(db, "posts"),
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc"),
        );
        const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
          const newPosts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Post[];
          setPosts(newPosts);
        });
        return () => unsubscribePosts();
      } else {
        setPosts([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await deleteDoc(doc(db, "posts", postId));
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const toggleReadMore = (postId: string) => {
    setExpandedPosts((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId],
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">Profile</h2>
        <p className="text-gray-600 mb-4">
          Please sign in to view your profile.
        </p>
        <Link
          to="/signin"
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-101 p-6">
      <div className="max-w-3xl mx-auto rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Your Profile</h2>
          <button
            onClick={handleSignOut}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Sign Out
          </button>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Your Posts</h3>
        <ul>
          {posts.map((post) => {
            const isExpanded = expandedPosts[post.id];
            const shouldTruncate = post.text.length > 200;

            return (
              <li
                key={post.id}
                className="mb-6 border rounded-lg p-4 bg-gray-50 shadow-sm hover:shadow-md transition"
              >
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt="Post"
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}
                <p className="text-gray-800 text-base mb-4">
                  {shouldTruncate && !isExpanded
                    ? `${post.text.slice(0, 150)}...`
                    : post.text}
                </p>
                {shouldTruncate && (
                  <button
                    onClick={() => toggleReadMore(post.id)}
                    className="text-blue-500 underline text-sm block mb-1"
                  >
                    {isExpanded ? "Read Less" : "Read More"}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(post.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded mt-2 hover:bg-red-600 transition"
                >
                  Delete Post
                </button>
              </li>
            );
          })}
        </ul>
        {posts.length === 0 && (
          <p className="text-gray-600 text-center mt-4">
            You haven't created any posts yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default Profile;
