"use client"

import { useChat } from "ai/react"
import { useEffect } from "react"

const endpoints = {
  rag: "http://43.199.182.104:9021/api/v1/agents/personal-chat/action?response_type=data&is_smooth_stream=1&model=deepseek-chat",
  chat: "https://personal-ai-agent.super-innovation-group.com/api/v1/agents/langgraph/chat/test",
}

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: endpoints.rag,
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_AI_API_TOKEN}`,
      },
      experimental_prepareRequestBody({ messages }) {
        return {
          messages,
          vector_collection_id: "e4bffead-b1f2-4b9d-bb3c-a9876794b7b6",
        }
      },
    })

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div className="space-y-4">
        {messages.map((m) => (
          <div key={m.id} className="whitespace-pre-wrap">
            <div>
              <div className="font-bold">{m.role}</div>
              <p>
                {m.content.length > 0 ? (
                  m.content
                ) : (
                  <span className="italic font-light">
                    {"calling tool: " + m?.toolInvocations?.[0].toolName}
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
        {error && <div className="italic font-light">{"error"}</div>}
        {isLoading && <div className="italic font-light">{"thinking..."}</div>}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  )
}
