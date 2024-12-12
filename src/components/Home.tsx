import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import Comments from "./Comments";

// Generating a unique anonymous ID based on the userID
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

interface Post {
  id: string;
  text: string;
  userId: string;
}

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [visibleComments, setVisibleComments] = useState<{
    [key: string]: boolean;
  }>({});
  const [expandedPosts, setExpandedPosts] = useState<{ [id: string]: boolean }>(
    {},
  );

  useEffect(() => {
    const postsQuery = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const newPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(newPosts);

      // Initializing visibility state for new posts
      const visibilityState: { [key: string]: boolean } = {};
      newPosts.forEach((post) => {
        visibilityState[post.id] = false;
      });
      setVisibleComments(visibilityState);
    });

    return () => unsubscribe();
  }, []);

  const toggleCommentsVisibility = (postId: string) => {
    setVisibleComments((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId],
    }));
  };

  const toggleReadMore = (postId: string) => {
    setExpandedPosts((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId],
    }));
  };

  return (
    <div className="container mx-auto px-4 pb-20">
      <h2 className="text-2xl font-bold mb-6 mt-6 text-gray-800">Explore</h2>
      <div className="space-y-6">
        {posts.map((post) => {
          const isExpanded = expandedPosts[post.id];
          const shouldTruncate = post.text.length > 300;
          const anonymousUser = generateAnonymousId(post.userId);

          return (
            <div
              key={post.id}
              className="p-4 border rounded-lg shadow-lg bg-white hover:shadow-xl transition duration-300"
            >
              <p className="text-sm text-gray-500 mb-2">
                Posted by: {anonymousUser}
              </p>

              <p className="text-gray-800 mb-3">
                {shouldTruncate && !isExpanded ? (
                  <>
                    {post.text.slice(0, 300)}...
                    <span
                      onClick={() => toggleReadMore(post.id)}
                      className="text-blue-500 cursor-pointer ml-1 text-sm font-semibold hover:underline"
                    >
                      Read More
                    </span>
                  </>
                ) : (
                  <>
                    {post.text}
                    {shouldTruncate && (
                      <span
                        onClick={() => toggleReadMore(post.id)}
                        className="text-blue-500 cursor-pointer ml-1 text-sm font-semibold hover:underline"
                      >
                        Read Less
                      </span>
                    )}
                  </>
                )}
              </p>

              <button
                onClick={() => toggleCommentsVisibility(post.id)}
                className="text-blue-500 underline text-sm"
              >
                {visibleComments[post.id] ? "Hide KindWords" : "KindWords"}
              </button>
              {visibleComments[post.id] && <Comments postId={post.id} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
