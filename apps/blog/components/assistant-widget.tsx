"use client";

import { ChatWidget } from "@repo/chat-ui";
import { usePathname } from "next/navigation";

export function AssistantWidget() {
  const apiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL;
  const pathname = usePathname();

  if (!apiUrl || pathname === "/chat") return null;

  const slugMatch = pathname.match(/^\/blog\/([^/]+)$/);
  const contextSlug = slugMatch?.[1];

  return <ChatWidget apiUrl={apiUrl} contextSlug={contextSlug} />;
}
