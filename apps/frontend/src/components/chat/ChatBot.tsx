/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client";

import { useChat, type Message } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      {/* Floating Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="Toggle AI Chat"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[350px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center gap-3 bg-primary p-4 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold leading-tight">Janta Medicare AI</h3>
              <p className="text-xs text-primary-content/80">
                Always here to help
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted">
                <Bot className="mb-3 h-10 w-10 opacity-50" />
                <p className="text-sm">
                  Hi! I can help you find medicines, check rate charts, or
                  suggest a doctor.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {messages.map((m: Message) => (
                  <div
                    key={m.id}
                    className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        m.role === "user"
                          ? "bg-secondary text-white"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {m.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 text-[0.9375rem] ${
                        m.role === "user"
                          ? "bg-primary text-white"
                          : "bg-neutral-100 text-foreground"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                    <div className="flex items-center rounded-2xl bg-neutral-100 px-4 py-2">
                      <span className="flex gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted"></span>
                        <span
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted"
                          style={{ animationDelay: "0.2s" }}
                        ></span>
                        <span
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted"
                          style={{ animationDelay: "0.4s" }}
                        ></span>
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-line bg-surface p-3"
          >
            <div className="flex items-center gap-2 rounded-full border border-line bg-neutral-50 pr-1 pl-4 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
              <input
                value={input || ''}
                onChange={handleInputChange}
                placeholder="Ask about a medicine or test..."
                className="flex-1 bg-transparent py-3 text-[0.9375rem] outline-none placeholder:text-muted"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!(input || '').trim() || isLoading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
              >
                <Send className="h-4 w-4 -ml-0.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
