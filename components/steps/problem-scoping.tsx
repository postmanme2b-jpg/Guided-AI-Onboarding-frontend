"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Send, Bot, User, Sparkles, ArrowRight, Edit3, Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface Message {
  id: string
  type: "user" | "ai" | "analysis"
  content: string;
  data?: any;
  timestamp: Date
}

interface ProblemScopingProps {
  onComplete: (data: any) => void
  onUpdateData: (data: any) => void;
  data: any,
  socket: WebSocket | null;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}


export function ProblemScoping({ onComplete, onUpdateData, socket, messages, setMessages }: ProblemScopingProps) {
  const [currentInput, setCurrentInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [refinedStatement, setRefinedStatement] = useState("")
  const [finalScope, setFinalScope] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null); // Ref for scrolling
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Ref for textarea element

  // Auto-scroll to the bottom of the chat when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.type === 'ai') {
        const messageData = lastMessage.data || {};
        const workScope = messageData.work_scope || messageData.final_spec?.scope || messageData.specification?.scope;

        if (workScope && workScope.description) {
            const refined = `How might we innovate on "${workScope.description.toLowerCase()}"? This challenge will focus on the area of ${workScope.type || 'general innovation'}.`
            setRefinedStatement(refined);
            setFinalScope(workScope);
            setShowAnalysis(true);
            setIsProcessing(false);

            // Immediately notify the parent that the step is complete to enable the footer button
            onUpdateData({
              messages,
              refinedStatement: refined,
              problemStatement: workScope.description,
              challengeType: workScope.type,
              completed: true,
            });
        } else {
            setIsProcessing(false);
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);


  const sendMessage = async () => {
    if (!currentInput.trim() || !socket || socket.readyState !== WebSocket.OPEN) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: currentInput,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setCurrentInput("")
    setIsProcessing(true)

    // Reset textarea height after sending message
    if (textareaRef.current) {
      textareaRef.current.style.height = "38px"; // Reset to initial height
    }

    socket.send(JSON.stringify({ role: "user", content: userMessage.content }));
  }

  const handleContinueToNext = () => {
    onComplete({
      messages,
      refinedStatement,
      problemStatement: finalScope?.description || '',
      challengeType: finalScope?.type || '',
      completed: true,
    })
  }

  const handleAdjustStatement = () => {
    setShowAnalysis(false);
    setIsProcessing(true);
    // Also mark the step as incomplete again in the parent
    onUpdateData({ completed: false });

    const adjustPrompt = "That's not quite right, can we adjust the scope description?";

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: adjustPrompt,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage]);
    socket?.send(JSON.stringify({ role: "user", content: adjustPrompt }));
  }


  return (
    <div className="flex flex-col h-full">
      <div className="space-y-3 mb-4">
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Let's have a conversation to clearly define the problem you want to solve. I'll ask follow-up questions to
            help refine your challenge scope and create a focused problem statement that will guide your entire
            innovation process.
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-none flex-1 flex flex-col">
        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="space-y-4 flex-1 flex flex-col">
            {/* Chat Messages */}
            <div className="rounded-xl p-4 flex-1 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.type === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                    <div
                      className={`flex gap-2 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.type === "ai"
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                            : "bg-slate-600 text-white dark:bg-slate-400 dark:text-slate-900"
                        }`}
                      >
                        {message.type === "ai" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </div>
                      <div
                        className={`rounded-xl p-3 ${
                          message.type === "ai"
                            ? "bg-white border border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200"
                            : "bg-slate-600 text-white dark:bg-slate-400 dark:text-slate-900"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                </div>
              ))}
               {isProcessing && !showAnalysis && (
                <div className="flex gap-3 justify-start">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-600 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
               {showAnalysis && (
                 <div className="w-full max-w-2xl mx-auto">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-blue-900 dark:text-blue-100">
                        Refined Problem Statement
                        </span>
                    </div>
                    <p className="text-blue-800 dark:text-blue-200 mb-4 leading-relaxed">{refinedStatement}</p>
                    <div className="flex gap-3">
                        <Button onClick={handleContinueToNext} className="bg-blue-600 hover:bg-blue-700">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Continue to Challenge Type
                        </Button>
                        <Button
                        variant="outline"
                        onClick={handleAdjustStatement}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                        >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Adjust Statement
                        </Button>
                    </div>
                    </div>
                </div>
               )}
               <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            {!showAnalysis && (
              <div className="flex gap-2 pt-4 border-t">
                <Textarea
                  ref={textareaRef}
                  placeholder="Type your response..."
                  value={currentInput}
                  onChange={(e) => {
                      setCurrentInput(e.target.value);
                      const target = e.currentTarget;
                      target.style.height = "auto";
                      target.style.height = `${target.scrollHeight}px`;
                  }}
                  onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                      }
                  }}
                  disabled={isProcessing}
                  className="resize-none overflow-hidden max-h-[200px] min-h-[32px] h-[38px] border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 placeholder:text-gray-500 dark:placeholder:text-gray-400 bg-white"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!currentInput.trim() || isProcessing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
