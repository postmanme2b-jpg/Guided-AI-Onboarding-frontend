"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Target, Lightbulb, PenTool, Wrench, Users, Code, Info, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { useAiRecommendations } from "@/hooks/useAiRecommendations"


interface ChallengeTypeRecommendationProps {
  onUpdateData: (data: any) => void
  data: any
  problemStatement: any
}

const challengeTypesInfo: Record<string, any> = {
  ideation: {
    name: "The Brainstorm",
    description: "Generate breakthrough ideas",
    icon: Lightbulb,
  },
  theoretical: {
    name: "The Design",
    description: "Submit conceptual designs",
    icon: PenTool,
  },
  rtp: {
    name: "The Prototype",
    description: "Submit working non-commercial prototypes",
    icon: Wrench,
  },
  erfp: {
    name: "The Collaborator",
    description: "Attract collaborators via structured proposals",
    icon: Users,
  },
  prodigy: {
    name: "The Algorithm",
    description: "Solve algorithmic problems with automated scoring",
    icon: Code,
  },
}

export function ChallengeTypeRecommendation({ onUpdateData, data, problemStatement }: ChallengeTypeRecommendationProps) {
  const recommendations = data.recommendations || [];
  const selectedType = data.selectedType || "";

  const [impactPreviews, setImpactPreviews] = useState<Record<string, string>>({});
  const [loadingImpact, setLoadingImpact] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  const { data: aiSuggestions, isLoading: isGenerating } = useAiRecommendations<{ recommendations: any[] }>({
    endpoint: "recommendations",
    payload: {
      problem_statement: problemStatement.problemStatement,
    },
    enabled: !!problemStatement?.problemStatement,
  });

  // Pre-fill with AI suggestions (only first time if no data exists)
  useEffect(() => {
    if (aiSuggestions && !data.recommendations) {
        const processedRecommendations = aiSuggestions.recommendations
          .map((rec: any) => ({ ...rec, weight: rec.confidence }))
          .filter((rec: any) => challengeTypesInfo[rec.id.toLowerCase()])
          .sort((a: any, b: any) => b.confidence - a.confidence);

        if (processedRecommendations.length > 0) {
             onUpdateData({
                ...data,
                recommendations: processedRecommendations,
                selectedType: processedRecommendations[0].id,
                selectedTypeDetails: challengeTypesInfo[processedRecommendations[0].id.toLowerCase()],
                completed: true,
            });
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiSuggestions]);

  const selectChallengeType = (typeId: string) => {
    onUpdateData({
      ...data,
      selectedType: typeId,
      selectedTypeDetails: challengeTypesInfo[typeId.toLowerCase()],
      completed: true,
    });
  }

  const handleWeightChange = (id: string, newWeight: number) => {
    const newRecommendations = recommendations.map((rec: any) =>
      rec.id === id ? { ...rec, weight: newWeight } : rec
    );
    newRecommendations.sort((a, b) => b.weight - a.weight);
    onUpdateData({
        ...data,
        recommendations: newRecommendations,
    });
  };

  const fetchImpactPreview = async (typeId: string) => {
    if (impactPreviews[typeId] || loadingImpact === typeId) return;

    setLoadingImpact(typeId);
    toast.info("Generating impact preview...");
    try {
      const response = await fetch(`${apiUrl}/api/impact-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_statement: problemStatement.problemStatement,
          challenge_type: typeId
        }),
      });
      if (!response.ok) throw new Error("Failed to get impact preview.");

      const result = await response.json();
      setImpactPreviews(prev => ({ ...prev, [typeId]: result.impact_preview }));
    } catch (error: any) {
      toast.error("Error generating impact preview", { description: error.message });
    } finally {
      setLoadingImpact(null);
    }
  }

  const LoadingState = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <Skeleton className="h-6 w-6 mt-1 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-10 w-full mt-2" />
                </div>
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-accent" />
            AI Challenge Type Recommendations
          </CardTitle>
          <CardDescription>
            Based on your problem statement, here are the recommended challenge types. Adjust the weights to refine the ranking and select the best fit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isGenerating ? <LoadingState /> : (
            <div className="space-y-4">
              {recommendations.map((type: any) => {
                const typeInfo = challengeTypesInfo[type.id.toLowerCase()];
                if (!typeInfo) {
                  console.warn(`Unknown challenge type ID received from backend: ${type.id}`);
                  return null;
                }
                const Icon = typeInfo.icon;
                const isSelected = selectedType === type.id

                return (
                  <Card
                    key={type.id}
                    className={`transition-all ${
                      isSelected ? "border-blue-500 ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-900/20" : "hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between cursor-pointer" onClick={() => selectChallengeType(type.id)}>
                        <div className="flex items-start gap-4 flex-1">
                          <Icon className={`h-6 w-6 mt-1 ${isSelected ? 'text-blue-600' : 'text-muted-foreground'}`} />
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{typeInfo.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{typeInfo.description}</p>
                            <div className="text-xs p-2 bg-gray-100 dark:bg-gray-800 rounded flex items-start gap-2">
                              <strong className="flex-shrink-0">AI Commentary:</strong>
                              <span>{type.aiCommentary}</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-5 w-5 ml-auto" onMouseEnter={() => fetchImpactPreview(type.id)}>
                                      {loadingImpact === type.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Info className="h-3 w-3" />}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" align="end" className="max-w-xs">
                                    <p className="text-sm font-medium mb-1">Impact Preview</p>
                                    <p className="text-xs">{impactPreviews[type.id] || "Hover to generate..."}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                        <Badge variant={isSelected ? "default" : "secondary"}>{type.confidence}% Match</Badge>
                      </div>
                      <div className="mt-4 pl-10">
                        <div className="flex items-center gap-3">
                          <Label htmlFor={`slider-${type.id}`} className="text-xs text-muted-foreground whitespace-nowrap">Adjust Weight</Label>
                          <Slider
                            id={`slider-${type.id}`}
                            value={[type.weight]}
                            onValueChange={([val]) => handleWeightChange(type.id, val)}
                            max={100}
                            step={1}
                          />
                          <span className="text-xs font-medium w-8 text-right">{type.weight}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

