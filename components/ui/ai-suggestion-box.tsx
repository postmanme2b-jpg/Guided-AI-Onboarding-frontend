"use client"

import {useState} from "react"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {Button} from "@/components/ui/button"
import {Textarea} from "@/components/ui/textarea"
import {toast} from "sonner"
import {Sparkles, AlertTriangle} from "lucide-react"

interface AiSuggestionBoxProps {
  aiCommentary: string;
}

export function AiSuggestionBox({aiCommentary}: AiSuggestionBoxProps) {
  const [feedbackMessage, setFeedbackMessage] = useState("")

  const handleFeedbackSubmit = () => {
    if (!feedbackMessage.trim()) {
      toast.warning("Please enter your feedback before submitting.");
      return;
    }

    // In a real application, you would send this feedback to a logging service or API endpoint.
    console.log("Feedback Submitted:", {
      suggestion: aiCommentary,
      feedback: feedbackMessage,
      timestamp: new Date().toISOString(),
    });

    toast.success("Feedback Submitted", {
      description: "Thank you for helping us improve our AI suggestions.",
    });
    setFeedbackMessage(""); // Clear the textarea after submission
  };

  return (
    <div className="p-4 bg-secondary border border-primary/20 rounded-lg mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary"/>
          <span className="font-medium text-secondary-foreground text-sm">AI Suggestion</span>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <AlertTriangle className="h-4 w-4 mr-1"/> Report Issue
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Provide Feedback</h4>
                <p className="text-sm text-muted-foreground">
                  Help us improve by explaining what's wrong with this suggestion.
                </p>
              </div>
              <Textarea
                placeholder="Type your message here."
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
              />
              <Button onClick={handleFeedbackSubmit}>Submit Feedback</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {aiCommentary}
      </p>
    </div>
  );
}
