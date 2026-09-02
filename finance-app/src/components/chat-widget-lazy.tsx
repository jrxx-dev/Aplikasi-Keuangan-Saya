"use client";

import dynamic from "next/dynamic";

// Dynamic import for ChatWidget (client-only, deferred loading)
const ChatWidget = dynamic(
  () => import("@/components/finance/chat-widget").then(mod => ({ default: mod.ChatWidget })),
  { loading: () => null, ssr: false }
);

export function ChatWidgetLazy() {
  return <ChatWidget />;
}
