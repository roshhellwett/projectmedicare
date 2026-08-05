/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client";

import { useChat, type Message } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { usePathname } from "next/navigation";

export default function ChatBot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, error]);

  // Hide on admin pages
  if (pathname?.includes('/admin')) return null;

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-primary/50 active:scale-95"
          aria-label="Open AI Chat"
        >
          <MessageCircle className="h-6 w-6 animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[520px] max-h-[85vh] w-[350px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl transition-all animate-in fade-in zoom-in-95 slide-in-from-bottom-10 duration-300 ease-out">
          {/* Header */}
          <div className="relative flex items-center justify-between bg-primary p-3.5 text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 shadow-inner backdrop-blur-md">
                <Bot className="h-5 w-5 text-white" />
                <div className="absolute -bottom-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-green-500 ring-2 ring-primary">
                  <Sparkles className="h-2 w-2 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-wide text-white">Janta AI</h3>
                <p className="text-[0.7rem] font-medium text-primary-line">
                  Online and ready to help
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="rounded-full bg-white/10 p-1.5 text-white/90 transition-colors hover:bg-white/20 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-surface-muted p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-line-strong">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-3 rounded-full bg-primary-soft p-3 shadow-inner">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <h4 className="mb-1.5 text-base font-semibold text-foreground">How can we help?</h4>
                <p className="max-w-[220px] text-xs text-muted">
                  Ask me about medicines, pathology tests, or getting a doctor consultation.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {messages.map((m: Message) => (
                  <div
                    key={m.id}
                    className={`flex items-end gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full shadow-sm ${
                        m.role === "user"
                          ? "bg-foreground text-white"
                          : "bg-primary text-white"
                      }`}
                    >
                      {m.role === "user" ? (
                        <User className="h-3.5 w-3.5" />
                      ) : (
                        <Bot className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div
                      className={`relative max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                        m.role === "user"
                          ? "rounded-br-sm bg-foreground text-white"
                          : "rounded-bl-sm border border-line bg-surface text-foreground"
                      }`}
                    >
                      {m.role === "user" ? (
                        m.content
                      ) : (
                        <div className="prose prose-sm prose-slate max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {m.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-end gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex items-center rounded-2xl rounded-bl-sm border border-line bg-surface px-4 py-3 shadow-sm">
                      <span className="flex gap-1.5">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-line"></span>
                        <span
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-soft"
                          style={{ animationDelay: "0.15s" }}
                        ></span>
                        <span
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary"
                          style={{ animationDelay: "0.3s" }}
                        ></span>
                      </span>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="flex items-end gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent shadow-sm">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex items-center rounded-2xl rounded-bl-sm border border-accent-line bg-accent-soft px-4 py-2.5 text-[0.8rem] text-accent shadow-sm">
                      {error.message?.includes('429') || error.message?.includes('Too many')
                        ? "I'm receiving too many requests right now. Please try again in a minute." 
                        : "Sorry, I encountered an error. Please try again."}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="bg-surface p-3 border-t border-line">
            <form
              onSubmit={handleSubmit}
              className="relative flex items-center"
            >
              <input
                value={input || ''}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="w-full rounded-full border border-line bg-surface-muted py-2.5 pl-4 pr-12 text-sm text-foreground shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 pointer-events-auto"
                autoFocus
              />
              <button
                type="submit"
                disabled={!(input || '').trim() || isLoading}
                className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50"
              >
                <Send className="ml-0.5 h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
