import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquare, Reply, Send, ThumbsUp, X } from "lucide-react";
import { getProposalComments, postProposalComment } from "@/api/comment";

interface Author {
  id: number;
  name: string;
  role: string;
  avatar?: string;
  email?: string;
}

interface Comment {
  id: number;
  content: string;
  timestamp?: string;
  createdAt?: string;
  user: Author;
  likes: number;
  parentId: number | null;
  replies?: Comment[];
  proposalId?: number;
  userId?: number;
}

export default function FounderCommentsSection({
  proposalId,
}: {
  proposalId: string;
}) {
  const [newCommentText, setNewCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await getProposalComments(proposalId);
        
        const processedData = data.map((comment: any) => {
          const processedComment = { ...comment, likes: 0 };
          
          if (comment.replies && comment.replies.length > 0) {
            processedComment.replies = comment.replies.map((reply: any) => ({
              ...reply,
              likes: 0,
            }));
          }
          
          return processedComment;
        });
        
        setComments(processedData);
      } catch (err) {
        console.error("Failed to fetch comments:", err);
      }
    };

    if (proposalId) fetchComments();
  }, [proposalId]);

  const handleSubmitComment = async () => {
    if (!newCommentText.trim()) return;

    try {
      const created = await postProposalComment(proposalId, newCommentText);
      
      // Create a new comment object with the required structure
      const newComment: Comment = {
        ...created,
        likes: 0,
        replies: [],
      };
      
      setComments([...comments, newComment]);
      setNewCommentText("");
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  };

  const handleSubmitReply = async (parentId: number) => {
    if (!replyContent.trim()) return;

    try {
      const created = await postProposalComment(
        proposalId,
        replyContent,
        parentId
      );

      const newReply: Comment = {
        ...created,
        likes: 0,
      };

      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply]
            };
          }
          return comment;
        })
      );

      setExpandedReplies(prev => {
        const newSet = new Set(prev);
        newSet.add(parentId);
        return newSet;
      });

      setReplyingTo(null);
      setReplyContent("");
    } catch (err) {
      console.error("Failed to post reply:", err);
    }
  };

  const handleLikeComment = (commentId: number, isReply = false, parentId?: number) => {
    if (isReply && parentId) {
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: comment.replies?.map(reply => 
                reply.id === commentId 
                  ? { ...reply, likes: reply.likes + 1 } 
                  : reply
              )
            };
          }
          return comment;
        })
      );
    } else {
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId 
            ? { ...comment, likes: comment.likes + 1 } 
            : comment
        )
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const toggleReplies = (commentId: number) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const renderComment = (comment: Comment, isReply = false, parentId?: number) => (
    <div
      className={`${
        isReply ? "ml-12 mt-3 border-l-2 border-gray-200 pl-3" : ""
      }`}
    >
      <div className="flex gap-3">
        <Avatar>
          <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
          <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <h5 className="font-medium text-gray-800">{comment.user.name}</h5>
              <p className="text-xs text-gray-500">
                {comment.user.role} • {formatDate(comment.createdAt || comment.timestamp || '')}
              </p>
            </div>
          </div>
          <p className="mt-2 text-gray-700">{comment.content}</p>
          <div className="mt-2 flex items-center space-x-4">
            <button
              className="flex items-center text-xs text-gray-500 hover:text-indigo-600"
              onClick={() => handleLikeComment(comment.id, isReply, parentId)}
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              {comment.likes > 0 ? comment.likes : "Like"}
            </button>
            {!isReply && (
              <button
                className="flex items-center text-xs text-gray-500 hover:text-indigo-600"
                onClick={() =>
                  setReplyingTo(replyingTo === comment.id ? null : comment.id)
                }
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </button>
            )}
            {!isReply && comment.replies && comment.replies.length > 0 && (
              <button
                className="flex items-center text-xs text-gray-500 hover:text-indigo-600"
                onClick={() => toggleReplies(comment.id)}
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                {comment.replies.length}{" "}
                {comment.replies.length === 1 ? "Reply" : "Replies"}
                {expandedReplies.has(comment.id) ? " (Hide)" : " (Show)"}
              </button>
            )}
          </div>

          {replyingTo === comment.id && (
            <div className="mt-3 flex gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src="/avatars/you.jpg" alt="Your avatar" />
                <AvatarFallback>YO</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder={`Reply to ${comment.user.name}...`}
                  className="min-h-16 resize-none text-sm"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setReplyingTo(null)}
                  >
                    <X className="h-3 w-3 mr-1" /> Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={!replyContent.trim()}
                  >
                    <Send className="h-3 w-3 mr-1" /> Reply
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Render replies with toggle */}
          {!isReply && 
            comment.replies && 
            comment.replies.length > 0 && 
            expandedReplies.has(comment.id) && (
              <div className="mt-3 space-y-3">
                {comment.replies.map((reply) => (
                  <div key={reply.id}>
                    {renderComment(reply, true, comment.id)}
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );

  // Get a count of all comments including replies
  const getTotalCommentCount = () => {
    let count = comments.length;
    comments.forEach(comment => {
      if (comment.replies) {
        count += comment.replies.length;
      }
    });
    return count;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-md font-medium text-gray-700 mb-3">
          Add a comment
        </h4>
        <div className="flex gap-3">
          <Avatar>
            <AvatarImage src="/avatars/you.jpg" alt="Your avatar" />
            <AvatarFallback>YO</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="Share your thoughts or ask a question..."
              className="min-h-24 resize-none"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={!newCommentText.trim()}
              >
                <Send className="mr-2 h-4 w-4" /> Post Comment
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-md font-medium text-gray-700 mb-4">
          Comments ({getTotalCommentCount()})
        </h4>
        {comments.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {comments.map((comment, index) => (
              <div key={comment.id}>
                {index > 0 && <hr className="my-4 border-gray-200" />}
                {renderComment(comment)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}