"use client";

import { CommentsDialogProps, DetailedComment } from "@/types";
import { formatNeo4jDate } from "@/util/dateUtil";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSession } from "next-auth/react";
import React, { useState } from "react";

const CommentsDialog = ({
  isOpen,
  onClose,
  comments,
  loading,
  onCommentSubmit,
  onCommentDelete,
} : CommentsDialogProps) => {
  const { data: session } = useSession();

  const [newComment, setNewComment] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full px-4 py-16">
      <div className="relative bg-white rounded-lg shadow-xl mx-auto max-w-2xl p-4">
        <button
          onClick={onClose}
          className="absolute top-0 right-0 mt-4 mr-4 text-xl z-10"
          >
          &times;
        </button>

        {loading ? (
          <div className="text-center py-10">Loading comments...</div>
        ) : (
          <div className="mb-4 overflow-y-auto max-h-60">
            {comments.map((comment, index) => (
              <div
                key={index}
                className="mb-4 last:mb-0 p-2 border-b last:border-b-0 relative"
              >
                <div className="flex items-center mb-2">
                  <img
                    src={"default-avatar.png"}
                    alt="Avatar"
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  <div className="font-semibold">
                    {comment.user.firstName} {comment.user.lastName}
                  </div>
                </div>
                <p className="text-gray-600">{comment.comment.textContent}</p>
                <div className="text-gray-500 text-xs">
                  {formatNeo4jDate(comment.comment.createdAt)}
                </div>
                {comment.user.email === session?.user?.email && (
                  <button
                    onClick={() => onCommentDelete(comment.comment.uuid)}
                    className="absolute top-2 right-7 text-red-500 hover:text-red-600"
                  >
                    <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full border-gray-300 rounded p-2 mb-4"
            placeholder="Write a comment..."
          />
          <button
            onClick={() => {
              onCommentSubmit(newComment);
              setNewComment("");
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded py-2 px-4"
          >
            Post Comment
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentsDialog;
