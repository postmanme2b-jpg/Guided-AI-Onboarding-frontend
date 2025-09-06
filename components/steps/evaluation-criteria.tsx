"use client"

import { useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, Scale, CheckSquare, MessageCircle, Plus, Trash2, Sparkles } from "lucide-react"
import { useAiRecommendations } from "@/hooks/useAiRecommendations"
import {AiSuggestionBox} from "@/components/ui/ai-suggestion-box";

interface EvaluationCriteriaProps {
  onUpdateData: (data: any) => void;
  data: any;
  problemStatement: any;
  challengeType: any;
}

const scoringModels = [
  { id: "weighted", label: "Weighted Scoring", description: "Score submissions on multiple criteria with different weights", icon: Scale },
  { id: "checklist", label: "Checklist Evaluation", description: "Pass/fail criteria for each requirement", icon: CheckSquare },
  { id: "feedback", label: "Open Feedback", description: "Qualitative feedback without numerical scores", icon: MessageCircle },
]

const LoadingState = () => (
  <div className="space-y-4">
    <div className="p-4 bg-muted/30 dark:bg-muted/80 border border-primary/10 rounded-lg">
      <Skeleton className="h-4 w-1/4 mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
    </div>
  </div>
);

export function EvaluationCriteria({ onUpdateData, data, problemStatement, challengeType }: EvaluationCriteriaProps) {
  const scoringModel = data.model || "weighted";
  const criteria = data.criteria || [];

  const totalWeight = useMemo(() => criteria.reduce((sum: number, c: any) => sum + (Number(c.weight) || 0), 0), [criteria]);

  const { data: aiSuggestions, isLoading: isGenerating } = useAiRecommendations<{
    criteria: any;
    scoringModel: any;
    audiences: string[], participationType: string, aiCommentary: string }>({
    endpoint: "evaluation-recommendations",
    payload: {
      problem_statement: problemStatement.problemStatement,
      challenge_type: challengeType.selectedType,
    },
    enabled: !!problemStatement?.problemStatement && !!challengeType?.selectedType,
  });

  useEffect(() => {
    if (aiSuggestions && !data.model) {
      onUpdateData({
        ...data,
        model: aiSuggestions.scoringModel,
        criteria: aiSuggestions.criteria,
        completed: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiSuggestions]);

  const handleUpdate = (updates: Partial<typeof data>) => {
    const newData = { ...data, ...updates };
    const isComplete = newData.model === 'weighted' ? newData.criteria.reduce((sum: number, c: any) => sum + (Number(c.weight) || 0), 0) === 100 : true;
    onUpdateData({ ...newData, completed: isComplete });
  };

  const updateCriteria = (index: number, field: string, value: string | number) => {
    const newCriteria = [...criteria];
    newCriteria[index] = { ...newCriteria[index], [field]: value };
    handleUpdate({ criteria: newCriteria });
  };

  const addCriteria = () => handleUpdate({ criteria: [...criteria, { name: "", weight: 0, description: "" }] });
  const removeCriteria = (index: number) => handleUpdate({ criteria: criteria.filter((_: any, i: number) => i !== index) });
  const applySuggestedCriteria = () => {
    if (aiSuggestions) {
      handleUpdate({
        model: aiSuggestions.scoringModel,
        criteria: aiSuggestions.criteria,
      });
    }
  };

  return (
    <div className="space-y-6" id="step-evaluation-criteria">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            How will submissions be judged?
          </CardTitle>
          <CardDescription>
            Choose an evaluation method that ensures fair and consistent judging.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isGenerating ? <LoadingState /> : (
            <>
              {aiSuggestions?.aiCommentary && (
                <AiSuggestionBox aiCommentary={aiSuggestions.aiCommentary} />
              )}
              <RadioGroup value={scoringModel} onValueChange={(value) => handleUpdate({ model: value })} className="space-y-3">
                {scoringModels.map((model) => {
                  const Icon = model.icon
                  return (
                    <Label key={model.id} htmlFor={model.id} className="flex items-start space-x-3 space-y-0 border rounded-md p-4 cursor-pointer has-[:checked]:bg-secondary has-[:checked]:border-primary/50">
                      <RadioGroupItem value={model.id} id={model.id} className="mt-1" />
                      <div className="space-y-1 flex-1">
                        <div className="font-medium flex items-center gap-2"> <Icon className="h-4 w-4" /> {model.label} </div>
                        <p className="text-sm text-muted-foreground">{model.description}</p>
                      </div>
                    </Label>
                  )
                })}
              </RadioGroup>
            </>
          )}
        </CardContent>
      </Card>

      {scoringModel === "weighted" && (
        <Card>
          <CardHeader>
            <CardTitle>Scoring Criteria</CardTitle>
            <CardDescription>
              Define the criteria and their relative importance. Total weight must equal 100%.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(criteria as any[]).map((criterion, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Input placeholder="Criteria name" value={criterion.name} onChange={(e) => updateCriteria(index, 'name', e.target.value)} className="flex-1" />
                  <Button variant="outline" size="icon" onClick={() => removeCriteria(index)} disabled={criteria.length <= 1}> <Trash2 className="h-4 w-4" /> </Button>
                </div>
                <div className="space-y-2">
                  <Label>Weight: {criterion.weight}%</Label>
                  <Slider value={[criterion.weight]} onValueChange={([value]) => updateCriteria(index, 'weight', value)} max={100} step={5} />
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={addCriteria}> <Plus className="h-4 w-4 mr-2" /> Add Criteria </Button>
              <div className={`text-sm font-medium ${totalWeight === 100 ? "text-green-600" : "text-orange-600"}`}>
                Total Weight: {totalWeight}%
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

