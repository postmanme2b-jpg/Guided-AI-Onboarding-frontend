"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, DollarSign, Award, Gift, Plus, Trash2 } from "lucide-react"
import { useAiRecommendations } from "@/hooks/useAiRecommendations"
import { AiSuggestionBox } from "@/components/ui/ai-suggestion-box"

interface PrizeConfigurationProps {
  onUpdateData: (data: any) => void;
  data: any;
  problemStatement: any;
  challengeType: any;
}

const prizeTypes = [
  { id: "monetary", label: "Monetary Prizes", description: "Cash rewards for winners", icon: DollarSign },
  { id: "recognition", label: "Recognition Only", description: "Certificates and public recognition", icon: Award },
  { id: "mixed", label: "Mixed Rewards", description: "Combination of monetary and non-monetary", icon: Gift },
  { id: "none", label: "No Prizes", description: "Participation-driven challenge", icon: Trophy },
]

const LoadingState = () => (
  <div className="space-y-4">
    <div className="p-4 bg-muted/30 dark:bg-muted/80 border border-primary/10 rounded-lg">
      <Skeleton className="h-4 w-1/4 mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
    </div>
  </div>
);

export function PrizeConfiguration({ onUpdateData, data, problemStatement, challengeType }: PrizeConfigurationProps) {
  const prizeType = data.prizeType || "recognition";
  const totalBudget = data.totalBudget || "";
  const prizes = data.prizes || [{ position: "1st Place", amount: "", description: "" }];
  const recognitionPlan = data.recognitionPlan || "";

  const { data: aiSuggestions, isLoading: isGenerating } = useAiRecommendations<{
    recognitionPlan: any;
    prizes: any;
    totalBudget: any;
    prizeType: any;
    audiences: string[], participationType: string, aiCommentary: string }>({
    endpoint: "prize-recommendations",
    payload: {
      problem_statement: problemStatement.problemStatement,
      challenge_type: challengeType.selectedType,
    },
    enabled: !!problemStatement?.problemStatement && !!challengeType?.selectedType,
  });

  useEffect(() => {
    if (aiSuggestions && !data.prizeType) {
      onUpdateData({
        ...data,
        prizeType: aiSuggestions.prizeType,
        totalBudget: aiSuggestions.totalBudget,
        prizes: aiSuggestions.prizes,
        recognitionPlan: aiSuggestions.recognitionPlan,
        completed: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiSuggestions]);

  const handleUpdate = (updates: Partial<typeof data>) => {
    onUpdateData({ ...data, ...updates, completed: true });
  };

  const updatePrize = (index: number, field: string, value: string) => {
    const newPrizes = [...prizes];
    newPrizes[index] = { ...newPrizes[index], [field]: value };
    handleUpdate({ prizes: newPrizes });
  };

  const addPrize = () => handleUpdate({ prizes: [...prizes, { position: "", amount: "", description: "" }] });
  const removePrize = (index: number) => handleUpdate({ prizes: prizes.filter((_: any, i: number) => i !== index) });

  return (
    <div className="space-y-6" id="step-prize-configuration">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Prize Structure
          </CardTitle>
          <CardDescription>
            Define how you'll reward and recognize participants.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isGenerating ? <LoadingState /> : (
            <>
              {aiSuggestions?.aiCommentary && (
                 <AiSuggestionBox aiCommentary={aiSuggestions.aiCommentary} />
              )}
              <RadioGroup value={prizeType} onValueChange={(value) => handleUpdate({ prizeType: value })} className="space-y-3">
                {prizeTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <Label key={type.id} htmlFor={type.id} className="flex items-start space-x-3 space-y-0 border rounded-md p-4 cursor-pointer has-[:checked]:bg-secondary has-[:checked]:border-primary/50">
                      <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                      <div className="space-y-1 flex-1">
                        <div className="font-medium flex items-center gap-2"> <Icon className="h-4 w-4" /> {type.label} </div>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </Label>
                  )
                })}
              </RadioGroup>
            </>
          )}
        </CardContent>
      </Card>

      {(prizeType === "monetary" || prizeType === "mixed") && (
        <Card>
          <CardHeader>
            <CardTitle>Budget & Prize Distribution</CardTitle>
            <CardDescription>Configure your prize amounts and budget.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="totalBudget">Total Prize Budget ($)</Label>
              <Input id="totalBudget" type="number" placeholder="e.g., 10000" value={totalBudget} onChange={(e) => handleUpdate({ totalBudget: e.target.value })} className="mt-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Prize Breakdown</Label>
                <Button variant="outline" size="sm" onClick={addPrize}> <Plus className="h-4 w-4 mr-2" /> Add Prize </Button>
              </div>

              {prizes.map((prize: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Input placeholder="Prize position (e.g., 1st Place)" value={prize.position} onChange={(e) => updatePrize(index, "position", e.target.value)} className="flex-1" />
                    <Input placeholder="Amount ($)" type="number" value={prize.amount} onChange={(e) => updatePrize(index, "amount", e.target.value)} className="w-32" />
                    <Button variant="outline" size="icon" onClick={() => removePrize(index)} disabled={prizes.length <= 1}> <Trash2 className="h-4 w-4" /> </Button>
                  </div>
                  <Input placeholder="Prize description (e.g., mentorship session)" value={prize.description} onChange={(e) => updatePrize(index, "description", e.target.value)} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"> <Award className="h-5 w-5 text-primary" /> Recognition Plan </CardTitle>
          <CardDescription>How will you recognize all participants?</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea placeholder="Describe your recognition plan..." value={recognitionPlan} onChange={(e) => handleUpdate({ recognitionPlan: e.target.value })} className="min-h-[120px]" />
          {aiSuggestions?.recognitionPlan && (
            <Button variant="outline" size="sm" className="mt-2" onClick={() => handleUpdate({ recognitionPlan: aiSuggestions.recognitionPlan })}>
              Use AI Suggestion
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

