import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import Comments from "./Comments";

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
    <div>
      <h2 className="text-2xl font-bold mb-4 text-center">Home Feed</h2>
      <div className="to-right">
        {posts.map((post) => {
          const isExpanded = expandedPosts[post.id];
          const shouldTruncate = post.text.length > 300;

          return (
            <div key={post.id} className="mb-6 pb-4 border-b border-black">
              <p className="mb-2">
                {shouldTruncate && !isExpanded ? (
                  <>
                    {post.text.slice(0, 300)}...
                    <button
                      onClick={() => toggleReadMore(post.id)}
                      className="text-blue-500 underline text-sm ml-1"
                    >
                      Read More
                    </button>
                  </>
                ) : (
                  <>
                    {post.text}
                    {shouldTruncate && (
                      <button
                        onClick={() => toggleReadMore(post.id)}
                        className="text-blue-500 underline text-sm ml-1"
                      >
                        Read Less
                      </button>
                    )}
                  </>
                )}
              </p>
              <button
                onClick={() => toggleCommentsVisibility(post.id)}
                className="text-blue-500 underline mb-2"
              >
                {visibleComments[post.id] ? "Hide KindWords" : "Show KindWords"}
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
