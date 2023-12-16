"use client";

import {
  addCommentToPost,
  deleteComment,
  deletePostAndComments,
  getAllPosts,
  getCommentsByPostUuid,
  likePost,
  unlikePost,
} from "@/actions";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { formatNeo4jDate } from "@/util/dateUtil";
import CommentsDialog from "@/components/CommentsDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import { DetailedComment, DetailedPost } from "@/types";

export default function Page() {
  const router = useRouter();
  const { data: session } = useSession();
  const [posts, setPosts] = useState<DetailedPost[]>([]);
  const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false);
  const [currentComments, setCurrentComments] = useState<DetailedComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [selectedPostUuid, setSelectedPostUuid] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const email = session?.user?.email;

  useEffect(() => {
    const fetchData = async () => {
      if (email) {
        const postsData: DetailedPost[] = JSON.parse(
          await getAllPosts(email)
        );
        setPosts(postsData);
      }
    };

    if (session === undefined) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
      fetchData();
    }
  }, [session]);

  const handleCommentClick = async (postUuid: string) => {
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

  const handleCommentSubmit = async (commentText: string) => {
    try {
      if (email) {
        await addCommentToPost(
          selectedPostUuid,
          email,
          commentText
        );
        setIsCommentsDialogOpen(false);
        setPosts(
          posts.map((post) => {
            if (post.post.uuid === selectedPostUuid) {
              post.commentsCount += 1;
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
    }
  };

  const handleDeletePost = async (postUuid: string) => {
    try {
      if (email) {
        await deletePostAndComments(postUuid, email);
        setPosts(posts.filter((post) => post.post.uuid !== postUuid));
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const handleDeleteComment = async (commentUuid: string) => {
    try {
      if (email) {
        await deleteComment(commentUuid, email);
        setCurrentComments(
          currentComments.filter(
            (comment) => comment.comment.uuid !== commentUuid
          )
        );
        setPosts(
          posts.map((post) => {
            if (post.post.uuid === selectedPostUuid) {
              post.commentsCount -= 1;
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const handleLikeClick = async (postUuid: string, isLiked: boolean) => {
    try {
      if (email && isLiked) {
        await unlikePost(postUuid, email);
        setPosts(
          posts.map((post) => {
            if (post.post.uuid === postUuid) {
              post.isLikedByUser = false;
              post.likeCount -= 1;
            }
            return post;
          })
        );
      } else {
        if (email) {
          await likePost(postUuid, email);
          setPosts(
            posts.map((post) => {
              if (post.post.uuid === postUuid) {
                post.isLikedByUser = true;
                post.likeCount += 1;
              }
              return post;
            })
          );
        }
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!session) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h2 className="text-2xl font-semibold mb-4">Welcome to Post Spot!</h2>
        <p className="mb-4">
          Join the community by sharing your thoughts, commenting on posts, and
          engaging with others.
        </p>
        <div>
          <button
            onClick={() => router.push("/auth/signIn")}
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded mr-2 hover:bg-blue-600"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push("/auth/signUp")}
            className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600"
          >
            Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {posts.map(
        ({ post, user, commentsCount, likeCount, isLikedByUser }, index) => (
          <div
            key={index}
            className="mb-6 p-4 bg-white rounded-lg shadow-lg relative"
          >
            {/* Conditional rendering of the delete button */}
            {user.email === email && (
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
              <button
                className="text-blue-500"
                onClick={() => handleLikeClick(post.uuid, isLikedByUser)}
              >
                {isLikedByUser ? "Unlike" : "Like"} ({likeCount})
              </button>
              <button
                onClick={() => handleCommentClick(post.uuid)}
                className="text-green-500 hover:text-green-600"
              >
                Comment ({commentsCount})
              </button>
            </div>
          </div>
        )
      )}

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
