"use client"

import { useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Clock, Plus, Trash2 } from "lucide-react"
import { useAiRecommendations } from "@/hooks/useAiRecommendations"
import { AiSuggestionBox } from "@/components/ui/ai-suggestion-box"

interface TimelineMilestonesProps {
  onUpdateData: (data: any) => void;
  data: any;
  problemStatement: any;
  challengeType: any;
}

const LoadingState = () => (
    <div className="space-y-4">
        <div className="p-4 bg-muted/80 border border-primary/10 rounded-lg">
            <Skeleton className="h-4 w-1/4 mb-2" />
            <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-3 pt-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
    </div>
);

export function TimelineMilestones({ onUpdateData, data, problemStatement, challengeType }: TimelineMilestonesProps) {
  const startDate = data.startDate || "";
  const endDate = data.endDate || "";
  const milestones = data.milestones || [];

  const duration = useMemo(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} days`;
      }
    }
    return "";
  }, [startDate, endDate]);

  const { data: aiSuggestions, isLoading: isGenerating } = useAiRecommendations({
    endpoint: "timeline-recommendations",
    payload: {
      problem_statement: problemStatement.problemStatement,
      challenge_type: challengeType.selectedType,
    },
    enabled: !!problemStatement?.problemStatement && !!challengeType?.selectedType,
  });

  useEffect(() => {
    if (aiSuggestions && !data.startDate) {
      onUpdateData({
        ...data,
        startDate: aiSuggestions.startDate,
        endDate: aiSuggestions.endDate,
        milestones: aiSuggestions.milestones,
        completed: !!(aiSuggestions.startDate && aiSuggestions.endDate),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiSuggestions]);

  const handleUpdate = (updates: Partial<typeof data>) => {
    const newData = { ...data, ...updates };
    onUpdateData({ ...newData, completed: !!(newData.startDate && newData.endDate) });
  };

  const updateMilestone = (index: number, field: string, value: string) => {
    const newMilestones = [...milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    handleUpdate({ milestones: newMilestones });
  };

  const addMilestone = () => handleUpdate({ milestones: [...milestones, { name: "", date: "", description: "" }] });
  const removeMilestone = (index: number) => handleUpdate({ milestones: milestones.filter((_: any, i: number) => i !== index) });
  const applySuggestedDates = () => {
    if (aiSuggestions) {
      handleUpdate({
        startDate: aiSuggestions.startDate,
        endDate: aiSuggestions.endDate,
        milestones: aiSuggestions.milestones,
      });
    }
  };

  return (
    <div className="space-y-6" id="step-timeline-milestones">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Challenge Timeline
          </CardTitle>
          <CardDescription>Set the overall timeline for your challenge from launch to completion.</CardDescription>
        </CardHeader>
        <CardContent>
          {isGenerating ? <LoadingState /> : (
            <>
              {aiSuggestions?.aiCommentary && (
                <div>
                  <AiSuggestionBox aiCommentary={aiSuggestions.aiCommentary} />
                  <Button variant="link" className="p-0 h-auto -mt-4 mb-4 text-primary" onClick={applySuggestedDates}>
                      Use these dates
                  </Button>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="startDate">Challenge Start Date</Label>
                  <Input id="startDate" type="date" value={startDate} onChange={(e) => handleUpdate({ startDate: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="endDate">Challenge End Date</Label>
                  <Input id="endDate" type="date" value={endDate} onChange={(e) => handleUpdate({ endDate: e.target.value })} className="mt-1" />
                </div>
              </div>

              {duration && (
                <div className="flex items-center gap-2 text-muted-foreground mt-4">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Total duration: {duration}</span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Milestones</CardTitle>
          <CardDescription>Define important dates and milestones throughout your challenge.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {milestones.map((milestone: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Input placeholder="Milestone name" value={milestone.name} onChange={(e) => updateMilestone(index, "name", e.target.value)} className="flex-1 font-medium" />
                <Input type="date" value={milestone.date} onChange={(e) => updateMilestone(index, "date", e.target.value)} className="w-40" />
                <Button variant="outline" size="icon" onClick={() => removeMilestone(index)} disabled={milestones.length <= 2}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea placeholder="Milestone description" value={milestone.description} onChange={(e) => updateMilestone(index, "description", e.target.value)} className="min-h-[60px]" />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addMilestone}>
            <Plus className="h-4 w-4 mr-2" />
            Add Milestone
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

