

'use client';

import { Check, CheckCheck, Clock } from "lucide-react";
import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/types";
import { format } from 'date-fns';
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  msg: ChatMessage;
  currentUserId: number;
  showDateBanner: boolean;
  onVisible: (id: string | number) => void;
}

export default function MessageBubble({ msg, currentUserId, showDateBanner, onVisible }: Props) {
  const isMine = msg.sender === currentUserId;
  const ref = useRef<HTMLDivElement | null>(null);

  const messageDate = msg.created_at ? new Date(msg.created_at) : new Date();

  const renderDateBanner = () => {
      const now = new Date();
      if (messageDate.toDateString() === now.toDateString()) return "Today";
      
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      if (messageDate.toDateString() === yesterday.toDateString()) return "Yesterday";

      return format(messageDate, "PPP");
  };

  const StatusIcon = () => {
    if (msg.pending) return <Clock size={16} className="text-gray-400" />;
    if (msg.status === "read") return <CheckCheck size={16} className="text-[#34B7F1]" />;
    if (msg.status === "delivered") return <CheckCheck size={16} className="text-gray-400" />;
    return <Check size={16} className="text-gray-400" />; // sent
  };

  useEffect(() => {
    if (!ref.current || !msg.id || isMine || msg.pending) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onVisible(msg.id!);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.8 }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [msg.id, isMine, onVisible, msg.pending]);

  return (
    <>
      {showDateBanner && (
        <div className="flex justify-center my-2">
            <div className="bg-secondary px-3 py-1 text-xs text-muted-foreground rounded-full shadow-sm">
                {renderDateBanner()}
            </div>
        </div>
      )}
      <div ref={ref} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
        <div className={`message-bubble ${isMine ? "message-bubble-outbound" : "message-bubble-inbound"} ${msg.image_url ? 'p-1' : ''}`}>
           {msg.image_url && (
            <div className="relative w-64 h-64 mb-1">
              <Image
                src={msg.image_url}
                alt="Chat image"
                layout="fill"
                objectFit="cover"
                className="rounded-md"
              />
              {msg.pending && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                   <Skeleton className="h-12 w-12 rounded-full bg-gray-400/50" />
                   <Clock className="h-6 w-6 text-white absolute" />
                </div>
              )}
            </div>
          )}
          
          <div className={`${msg.image_url ? 'px-2 pb-1' : ''}`}>
            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
              <span className="text-xs text-muted-foreground">
                {format(messageDate, 'p')}
              </span>
              {isMine && <StatusIcon />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
