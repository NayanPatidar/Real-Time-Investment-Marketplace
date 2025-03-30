import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, ThumbsUp } from "lucide-react";
import { getProposalComments, postProposalComment } from "@/api/comment";

interface Comment {
  id: number;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: number;
}

export default function FounderCommentsSection({
  proposalId,
}: {
  proposalId: string;
}) {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await getProposalComments(proposalId);
        const formatted = data.map((c: any) => ({
          id: c.id,
          author: {
            name: c.user.name,
            role: c.user.role,
            avatar: "/avatars/default.jpg",
          },
          content: c.content,
          timestamp: c.createdAt,
          likes: 0,
        }));
        setComments(formatted);
      } catch (err) {
        console.error("Failed to fetch comments:", err);
      }
    };

    if (proposalId) fetchComments();
  }, [proposalId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      const created = await postProposalComment(proposalId, newComment);
      const formatted = {
        id: created.id,
        author: {
          name: created.user.name,
          role: created.user.role,
          avatar: "/avatars/you.jpg",
        },
        content: created.content,
        timestamp: created.createdAt,
        likes: 0,
      };
      setComments([...comments, formatted]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  };

  const handleLikeComment = (commentId: number) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      )
    );
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
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
              >
                <Send className="mr-2 h-4 w-4" /> Post Comment
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-md font-medium text-gray-700 mb-4">
          Comments ({comments.length})
        </h4>
        {comments.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {comments.map((comment, index) => (
              <div key={comment.id}>
                {index > 0 && <hr className="my-4 border-gray-200" />}
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarImage
                      src={comment.author.avatar}
                      alt={comment.author.name}
                    />
                    <AvatarFallback>
                      {comment.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h5 className="font-medium text-gray-800">
                          {comment.author.name}
                        </h5>
                        <p className="text-xs text-gray-500">
                          {comment.author.role} •{" "}
                          {formatDate(comment.timestamp)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-gray-700">{comment.content}</p>
                    <div className="mt-2 flex items-center">
                      <button
                        className="flex items-center text-xs text-gray-500 hover:text-indigo-600"
                        onClick={() => handleLikeComment(comment.id)}
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {comment.likes > 0 ? comment.likes : "Like"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
