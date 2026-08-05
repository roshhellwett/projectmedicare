/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client";

import { useChat, type Message } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";

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
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-blue-500/50 active:scale-95"
          aria-label="Open AI Chat"
        >
          <MessageCircle className="h-7 w-7 animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[600px] max-h-[85vh] w-[380px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/70 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all animate-in fade-in zoom-in-95 slide-in-from-bottom-10 duration-300 ease-out">
          {/* Header */}
          <div className="relative flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white shadow-md">
            <div className="flex items-center gap-4">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-md">
                <Bot className="h-7 w-7 text-white" />
                <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 ring-2 ring-indigo-600">
                  <Sparkles className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-wide text-white">Janta AI</h3>
                <p className="text-sm font-medium text-blue-100/80">
                  Online and ready to help
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="rounded-full bg-white/10 p-2 text-white/90 transition-colors hover:bg-white/20 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50 p-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-full bg-blue-100 p-4 shadow-inner">
                  <Bot className="h-12 w-12 text-blue-600" />
                </div>
                <h4 className="mb-2 text-lg font-semibold text-slate-800">How can we help?</h4>
                <p className="max-w-[250px] text-sm text-slate-500">
                  Ask me about medicines, pathology tests, or getting a doctor consultation.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {messages.map((m: Message) => (
                  <div
                    key={m.id}
                    className={`flex items-end gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm ${
                        m.role === "user"
                          ? "bg-slate-800 text-white"
                          : "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                      }`}
                    >
                      {m.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`relative max-w-[75%] rounded-3xl px-5 py-3 text-[0.9375rem] leading-relaxed shadow-sm ${
                        m.role === "user"
                          ? "rounded-br-sm bg-slate-800 text-white"
                          : "rounded-bl-sm border border-slate-100 bg-white text-slate-700"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-end gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex items-center rounded-3xl rounded-bl-sm border border-slate-100 bg-white px-5 py-4 shadow-sm">
                      <span className="flex gap-1.5">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400"></span>
                        <span
                          className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                          style={{ animationDelay: "0.15s" }}
                        ></span>
                        <span
                          className="h-2 w-2 animate-bounce rounded-full bg-blue-600"
                          style={{ animationDelay: "0.3s" }}
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
          <div className="bg-white/80 p-4 backdrop-blur-lg">
            <form
              onSubmit={handleSubmit}
              className="relative flex items-center"
            >
              <input
                value={input || ''}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="w-full rounded-full border border-slate-200 bg-white py-3.5 pl-5 pr-14 text-sm text-slate-800 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!(input || '').trim() || isLoading}
                className="absolute right-1.5 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transition-all hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50"
              >
                <Send className="ml-0.5 h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
