"use client";

import {
  addCommentToPost,
  deleteComment,
  deletePostAndComments,
  getAllPosts,
  getCommentsByPostUuid,
} from "@/actions";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { formatNeo4jDate } from "@/util/dateUtil";
import CommentsDialog from "@/components/CommentsDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

export default function Page() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState([]);
  const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false);
  const [currentComments, setCurrentComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [selectedPostUuid, setSelectedPostUuid] = useState(null);

  useEffect(() => {
    if (session) {
      const fetchData = async () => {
        const postsData = JSON.parse(await getAllPosts());
        setPosts(postsData);
      };
      fetchData();
    }
  }, [session]);

  const handleCommentClick = async (postUuid) => {
    setLoadingComments(true);
    setSelectedPostUuid(postUuid);
    try {
      const commentsData = JSON.parse(await getCommentsByPostUuid(postUuid));
      setCurrentComments(commentsData);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
    setLoadingComments(false);
    setIsCommentsDialogOpen(true);
  };

  const handleCommentSubmit = async (commentText) => {
    try {
      await addCommentToPost(selectedPostUuid, session.user.email, commentText);
      setIsCommentsDialogOpen(false);
      setPosts(
        posts.map((post) => {
          if (post.post.uuid === selectedPostUuid) {
            post.commentsCount += 1; 
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Failed to submit comment:", error);
    }
  };

  const handleDeletePost = async (postUuid) => {
    try {
      await deletePostAndComments(postUuid, session.user.email);
      setPosts(posts.filter((post) => post.post.uuid !== postUuid));
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const handleDeleteComment = async (commentUuid) => {
    try {
      await deleteComment(commentUuid, session.user.email);
      setCurrentComments(
        currentComments.filter(
          (comment) => comment.comment.uuid !== commentUuid
        )
      );
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  if (!session) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      {posts.map(({ post, user, commentsCount }, index) => (
        <div
          key={index}
          className="mb-6 p-4 bg-white rounded-lg shadow-lg relative"
        >
          {/* Conditional rendering of the delete button */}
          {user.email === session.user.email && (
            <button
              onClick={() => handleDeletePost(post.uuid)}
              className="absolute top-4 right-4 text-red-500 hover:text-red-600"
            >
              <FontAwesomeIcon icon={faTrashAlt} className="h-5 w-5" />
            </button>
          )}

          <div className="flex items-center mb-4">
            <img
              src="default-avatar.png"
              alt="Avatar"
              className="w-10 h-10 rounded-full mr-2"
            />
            <div>
              <div className="font-semibold">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-gray-600 text-sm">
                {formatNeo4jDate(post.createdAt)}
              </div>
            </div>
          </div>
          <p className="mb-4">{post.textContent}</p>
          <div className="flex justify-between items-center">
            <button className="text-blue-500 hover:text-blue-600">Like</button>
            <button
              onClick={() => handleCommentClick(post.uuid)}
              className="text-green-500 hover:text-green-600"
            >
              Comment ({commentsCount})
            </button>
          </div>
        </div>
      ))}

      <CommentsDialog
        isOpen={isCommentsDialogOpen}
        comments={currentComments}
        onClose={() => setIsCommentsDialogOpen(false)}
        loading={loadingComments}
        onCommentSubmit={handleCommentSubmit}
        onCommentDelete={handleDeleteComment}
      />
    </div>
  );
}
