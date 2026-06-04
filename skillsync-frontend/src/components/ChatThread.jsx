import { useState, useEffect, useRef } from "react";
import axios from "../api/axios";
import useAuth from "../hooks/useAuth";

// Format timestamp nicely: "3:45 PM"
const formatTime = (dateStr) => {
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default function ChatThread({ sessionId, sessionStatus }) {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const pollingRef = useRef(null);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const res = await axios.get(`/api/messages/${sessionId}`);
      setMessages(res.data);
    } catch (err) {
      // Silently fail on polling errors
    }
  };

  // Fetch immediately on load then poll every 5 seconds
  useEffect(() => {
    fetchMessages();
    pollingRef.current = setInterval(fetchMessages, 5000);
    return () => clearInterval(pollingRef.current);
  }, [sessionId]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    setError("");

    // Optimistic update — show message instantly before API responds
    const optimisticMsg = {
      _id: `temp-${Date.now()}`,
      content: input.trim(),
      senderRole: user?.role,
      senderId: { _id: user?._id, name: user?.name },
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    const sentContent = input.trim();
    setInput("");

    try {
      await axios.post(`/api/messages/${sessionId}`, { content: sentContent });
      // Fetch real messages to replace optimistic one
      await fetchMessages();
    } catch (err) {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m._id !== optimisticMsg._id));
      setError("Failed to send. Please try again.");
      setInput(sentContent); // restore input
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    // Send on Enter, new line on Shift+Enter
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const canMessage = ["confirmed", "completed"].includes(sessionStatus);

  return (
    <div className="flex flex-col h-full bg-[#1a2332] rounded-2xl overflow-hidden border border-white/10">
      {/* Chat header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <p className="text-white/70 text-xs font-medium">Session Chat</p>
        <span className="ml-auto text-white/20 text-xs">
          Refreshes every 5s
        </span>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-white/30 text-xs">No messages yet</p>
            <p className="text-white/20 text-xs mt-1">Start the conversation</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe =
              msg.senderId?._id === user?._id || msg.senderId === user?._id;
            const showName =
              index === 0 || messages[index - 1]?.senderRole !== msg.senderRole;

            return (
              <div
                key={msg._id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                {/* Sender name — only show when role changes */}
                {showName && (
                  <p
                    className={`text-xs mb-1 font-medium ${
                      isMe ? "text-blue-400/70" : "text-emerald-400/70"
                    }`}
                  >
                    {isMe ? "You" : msg.senderId?.name}
                  </p>
                )}

                {/* Bubble */}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? "bg-blue-500 text-white rounded-br-sm"
                      : "bg-white/10 text-white/90 rounded-bl-sm"
                  } ${msg.isOptimistic ? "opacity-70" : ""}`}
                >
                  {msg.content}
                </div>

                {/* Timestamp */}
                <p className="text-white/20 text-xs mt-1">
                  {formatTime(msg.createdAt)}
                  {msg.isOptimistic && " · sending..."}
                </p>
              </div>
            );
          })
        )}
        {/* Invisible div to scroll to */}
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      {/* Input area */}
      <div className="px-3 py-3 border-t border-white/10 flex-shrink-0">
        {canMessage ? (
          <form onSubmit={handleSend} className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Enter to send)"
              rows={1}
              maxLength={1000}
              className="flex-1 bg-white/10 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-white/30 resize-none outline-none focus:border-blue-500/50 focus:bg-white/15 transition-all"
              style={{ maxHeight: "120px" }}
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="w-10 h-10 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0"
            >
              {sending ? (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </form>
        ) : (
          <p className="text-white/20 text-xs text-center py-2">
            Chat is only available for confirmed sessions
          </p>
        )}
      </div>
    </div>
  );
}
