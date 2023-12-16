export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type Post = {
  uuid: string;
  textContent: string;
  createdAt: Neo4jDateTime;
};

export type Comment = {
  uuid: string;
  textContent: string;
  createdAt: Neo4jDateTime;
};

export type DetailedPost = {
  post: Post;
  user: User;
  commentsCount: number;
  isLikedByUser: boolean;
  likeCount: number;
};

export type DetailedComment = {
  comment: Comment;
  user: User;
};

export type CommentsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  comments: DetailedComment[];
  loading: boolean;
  onCommentSubmit: (commentText: string) => void;
  onCommentDelete: (commentUuid: string) => void;
};

export type Neo4jInteger = {
  low: number;
  high: number;
};

export type Neo4jDateTime = {
  year: Neo4jInteger;
  month: Neo4jInteger;
  day: Neo4jInteger;
  hour: Neo4jInteger;
  minute: Neo4jInteger;
  second: Neo4jInteger;
  nanosecond: Neo4jInteger;
  timeZoneOffsetSeconds: Neo4jInteger;
};