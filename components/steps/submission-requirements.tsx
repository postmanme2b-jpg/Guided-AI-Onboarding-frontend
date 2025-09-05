"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Video, ImageIcon, Presentation, Code, Lightbulb, Sparkles } from "lucide-react"
import { DynamicForm } from "./dynamic-form"
import { Skeleton } from "@/components/ui/skeleton"
import { useAiRecommendations } from "@/hooks/useAiRecommendations"

interface SubmissionRequirementsProps {
  onUpdateData: (data: any) => void;
  data: any;
  problemStatement: any;
  challengeType: any;
}

const submissionTypes = [
  { id: "document", label: "Written Document", description: "Text-based proposals or reports", icon: FileText },
  { id: "presentation", label: "Pitch Deck", description: "Slide presentation or pitch", icon: Presentation },
  { id: "video", label: "Video Pitch", description: "Video demonstration or explanation", icon: Video },
  { id: "prototype", label: "Working Prototype", description: "Functional demo or mockup", icon: Code },
  { id: "design", label: "Visual Design", description: "Images, mockups, or wireframes", icon: ImageIcon },
  { id: "concept", label: "Concept Only", description: "Brief idea description", icon: Lightbulb },
]

const LoadingState = () => (
  <div className="space-y-6">
    <div className="p-4 bg-muted/50 border border-primary/10 rounded-lg">
      <Skeleton className="h-4 w-1/4 mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
    <div className="grid gap-3 md:grid-cols-2">
      {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
    </div>
    <div>
      <Skeleton className="h-8 w-1/3 mb-2" />
      <Skeleton className="h-24 w-full" />
    </div>
  </div>
);


export function SubmissionRequirements({ onUpdateData, data, problemStatement, challengeType }: SubmissionRequirementsProps) {
  const selectedTypes: string[] = data.types || [];
  const schema = data.schema || null;
  const formValues = { deliverables: data.deliverables || "" };

  const { data: aiSuggestions, isLoading: isGenerating } = useAiRecommendations<{ types: string[], instructions: string, aiCommentary: string, schema: any }>({
    endpoint: "submission-recommendations",
     payload: {
        problem_statement: problemStatement.problemStatement,
        challenge_type: challengeType.selectedType,
    },
    enabled: !!problemStatement?.problemStatement && !!challengeType?.selectedType,
  });

   useEffect(() => {
    if (aiSuggestions && !data.types) {
      onUpdateData({
        ...data,
        types: aiSuggestions.types,
        deliverables: aiSuggestions.instructions,
        schema: aiSuggestions.schema,
        completed: (aiSuggestions.types?.length || 0) > 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiSuggestions]);

  const handleTypeToggle = (typeId: string) => {
    const updatedTypes = selectedTypes.includes(typeId)
      ? selectedTypes.filter((id) => id !== typeId)
      : [...selectedTypes, typeId];
    onUpdateData({ ...data, types: updatedTypes, completed: updatedTypes.length > 0 });
  };

  const handleFormUpdate = (formData: any) => {
    onUpdateData({ ...data, ...formData, completed: selectedTypes.length > 0 });
  };

  return (
    <div className="space-y-6" id="step-submission-requirements">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            What should participants submit?
          </CardTitle>
          <CardDescription>
            Choose the submission formats that best suit your challenge goals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isGenerating ? <LoadingState /> : (
            <>
              {aiSuggestions?.aiCommentary && (
                <div className="p-4 bg-secondary border border-primary/20 rounded-lg mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-medium text-secondary-foreground text-sm">AI Suggestion</span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{aiSuggestions.aiCommentary}</p>
                </div>
              )}
              <div className="grid gap-3 md:grid-cols-2 mb-6">
                {submissionTypes.map((type) => {
                  const Icon = type.icon
                  const isSelected = selectedTypes.includes(type.id)
                  return (
                    <div
                      key={type.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors relative ${
                        isSelected ? "border-primary bg-primary/10 ring-2 ring-primary" : "hover:border-primary/50"
                      }`}
                      onClick={() => handleTypeToggle(type.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox checked={isSelected} onCheckedChange={() => handleTypeToggle(type.id)} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="h-4 w-4" />
                            <span className="font-medium">{type.label}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {schema && (
                <DynamicForm
                  schema={schema}
                  onValuesChange={handleFormUpdate}
                  defaultValues={formValues}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

