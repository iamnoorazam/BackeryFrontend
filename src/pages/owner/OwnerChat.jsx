import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Send, MessageSquare, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/atoms/Spinner";
import EmptyState from "@/components/atoms/EmptyState";
import { useConversations, useMessages, useSendMessage } from "@/hooks/useChat";
import { useAuth } from "@/store/authStore";
import { connectSocket, disconnectSocket, getSocket } from "@/services/socket";
import { formatDate } from "@/lib/utils";

const otherParticipant = (conv, myId) =>
  (conv.participants || []).find((p) => p._id !== myId) || conv.participants?.[0];

const OwnerChat = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: conversations, isLoading } = useConversations();
  const [activeId, setActiveId] = useState(null);
  const { data: messages } = useMessages(activeId);
  const sendMessage = useSendMessage();
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  // Live receive: join our room and refresh on inbound chat messages.
  useEffect(() => {
    if (!user?.id) return;
    connectSocket(user.id);
    const s = getSocket();
    const onMessage = (payload) => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      if (payload?.conversationId) {
        qc.invalidateQueries({ queryKey: ["messages", payload.conversationId] });
      }
    };
    s.on("chat_message", onMessage);
    return () => {
      s.off("chat_message", onMessage);
      disconnectSocket();
    };
  }, [user?.id, qc]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || !activeId) return;
    setText("");
    sendMessage.mutate({ conversationId: activeId, text: body });
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );

  const myId = user?.id;

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      <div className="grid md:grid-cols-[280px_1fr] gap-4 h-[70vh]">
        {/* Conversation list */}
        <div
          className={`rounded-2xl bg-white border border-stone-200 overflow-y-auto ${activeId ? "hidden md:block" : ""}`}
        >
          {!conversations?.length ? (
            <EmptyState icon="💬" title="No conversations" />
          ) : (
            conversations.map((c) => {
              const other = otherParticipant(c, myId);
              return (
                <button
                  key={c._id}
                  onClick={() => setActiveId(c._id)}
                  className={`w-full text-left px-4 py-3 border-b border-stone-100 hover:bg-stone-50 ${activeId === c._id ? "bg-stone-100" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm truncate">{other?.name || "User"}</p>
                    <span className="text-[10px] text-stone-400 shrink-0">
                      {formatDate(c.lastMessageAt)}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 truncate capitalize">
                    {other?.role} · {c.lastMessage || "No messages yet"}
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* Thread */}
        <div
          className={`rounded-2xl bg-white border border-stone-200 flex flex-col ${activeId ? "" : "hidden md:flex"}`}
        >
          {!activeId ? (
            <div className="flex-1 grid place-items-center text-stone-400">
              <div className="text-center">
                <MessageSquare className="h-10 w-10 mx-auto mb-2" />
                <p className="text-sm">Select a conversation</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-3 border-b border-stone-100 flex items-center gap-2">
                <button onClick={() => setActiveId(null)} className="md:hidden text-stone-500">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <p className="font-semibold text-sm">
                  {otherParticipant(conversations?.find((c) => c._id === activeId) || {}, myId)
                    ?.name || "Conversation"}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {(messages || []).map((m) => {
                  const mine = m.sender === myId || m.sender?._id === myId;
                  return (
                    <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? "bg-[#D2691E] text-white" : "bg-stone-100 text-stone-800"}`}
                      >
                        {m.text}
                        <div
                          className={`text-[9px] mt-0.5 ${mine ? "text-white/70" : "text-stone-400"}`}
                        >
                          {formatDate(m.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <form
                onSubmit={send}
                className="p-3 border-t border-stone-100 flex items-center gap-2"
              >
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-[#D2691E] hover:bg-[#A0522D] shrink-0"
                  disabled={!text.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerChat;
