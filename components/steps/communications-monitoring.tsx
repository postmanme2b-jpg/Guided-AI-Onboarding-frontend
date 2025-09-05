"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageSquare, Mail, Share2, Bell, BarChart3, Badge } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAiRecommendations } from "@/hooks/useAiRecommendations"
import { AiSuggestionBox } from "@/components/ui/ai-suggestion-box"

interface CommunicationsMonitoringProps {
  onUpdateData: (data: any) => void;
  data: any;
  problemStatement: any;
  challengeType: any;
}

const promotionChannels = [
  { id: "email", label: "Email Campaign", description: "Send to your mailing list", icon: Mail },
  { id: "social", label: "Social Media", description: "Share on social platforms", icon: Share2 },
  { id: "intranet", label: "Company Intranet", description: "Internal company channels", icon: MessageSquare },
  { id: "website", label: "Website Banner", description: "Feature on your website", icon: Bell },
]

const monitoringMetrics = [
  { id: "participation", label: "Participation Rate", description: "Track registration and submission rates" },
  { id: "engagement", label: "Engagement Metrics", description: "Monitor page views, time spent, interactions" },
  { id: "quality", label: "Submission Quality", description: "Track submission completeness and quality scores" },
  { id: "feedback", label: "Participant Feedback", description: "Collect satisfaction and experience feedback" },
]

const LoadingState = () => (
  <div className="space-y-4">
    <div className="p-4 bg-muted/80 border border-primary/10 rounded-lg">
      <Skeleton className="h-4 w-1/4 mb-2"/>
      <Skeleton className="h-4 w-3/4"/>
    </div>
    <div className="grid gap-3 md:grid-cols-2">
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full"/>)}
    </div>
  </div>
);

export function CommunicationsMonitoring({ onUpdateData, data, problemStatement, challengeType }: CommunicationsMonitoringProps) {
  const selectedChannels = data.channels || [];
  const selectedMetrics = data.metrics || ["participation", "engagement"];
  const kickoffMessage = data.kickoffMessage || "";
  const reportingFrequency = data.reportingFrequency || "weekly";

  const { data: aiSuggestions, isLoading: isGenerating } = useAiRecommendations({
    endpoint: "communications-recommendations",
    payload: {
      problem_statement: problemStatement.problemStatement,
      challenge_type: challengeType.selectedType,
    },
    enabled: !!problemStatement?.problemStatement && !!challengeType?.selectedType,
  });

  useEffect(() => {
    if (aiSuggestions && !data.channels) {
      onUpdateData({
        ...data,
        channels: aiSuggestions.channels,
        metrics: aiSuggestions.metrics,
        kickoffMessage: aiSuggestions.kickoffMessage,
        reportingFrequency: aiSuggestions.reportingFrequency,
        completed: (aiSuggestions.channels?.length || 0) > 0 && (aiSuggestions.metrics?.length || 0) > 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiSuggestions]);

  const handleUpdate = (updates: Partial<typeof data>) => {
    const newData = { ...data, ...updates };
    const isComplete = (newData.channels?.length || 0) > 0 && (newData.metrics?.length || 0) > 0;
    onUpdateData({ ...newData, completed: isComplete });
  };

  const handleChannelToggle = (channelId: string) => {
    const updatedChannels = selectedChannels.includes(channelId)
      ? selectedChannels.filter((id: string) => id !== channelId)
      : [...selectedChannels, channelId];
    handleUpdate({ channels: updatedChannels });
  };

  const handleMetricToggle = (metricId: string) => {
    const updatedMetrics = selectedMetrics.includes(metricId)
      ? selectedMetrics.filter((id: string) => id !== metricId)
      : [...selectedMetrics, metricId];
    handleUpdate({ metrics: updatedMetrics });
  };

  const applySuggestedMessage = () => {
    if (aiSuggestions) {
      handleUpdate({ kickoffMessage: aiSuggestions.kickoffMessage });
    }
  };

  return (
    <div className="space-y-6" id="step-communications-monitoring">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary"/>
            Communication Channels
          </CardTitle>
          <CardDescription>
            Select the channels you'll use to promote your challenge.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isGenerating ? <LoadingState/> : (
            <>
              {aiSuggestions?.aiCommentary && (
                <AiSuggestionBox aiCommentary={aiSuggestions.aiCommentary} />
              )}
              <div className="grid gap-3 md:grid-cols-2">
                {promotionChannels.map((channel) => {
                  const Icon = channel.icon
                  const isSelected = selectedChannels.includes(channel.id)
                  const isRecommended = aiSuggestions?.channels.includes(channel.id);

                  return (
                    <div
                      key={channel.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors relative ${
                        isSelected ? "border-primary bg-primary/10 ring-2 ring-primary" : "hover:border-primary/50"
                      }`}
                      onClick={() => handleChannelToggle(channel.id)}
                    >
                      {isRecommended && <Badge className="absolute -top-2 -right-2">AI Pick</Badge>}
                      <div className="flex items-start gap-3">
                        <Checkbox checked={isSelected} onCheckedChange={() => handleChannelToggle(channel.id)} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="h-4 w-4"/>
                            <span className="font-medium">{channel.label}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{channel.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kickoff Message</CardTitle>
          <CardDescription>
            Craft an engaging announcement to launch your challenge.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isGenerating ? <Skeleton className="h-32 w-full" /> : (
            <>
              <Textarea
                placeholder="Write your kickoff message..."
                value={kickoffMessage}
                onChange={(e) => handleUpdate({ kickoffMessage: e.target.value })}
                className="min-h-[150px]"
              />
              {aiSuggestions?.kickoffMessage && (
                <Button variant="outline" size="sm" className="mt-2" onClick={applySuggestedMessage}>
                  Use AI Suggestion
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary"/>
            Monitoring & Analytics
          </CardTitle>
          <CardDescription>Choose metrics to track to measure challenge success.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isGenerating ? <Skeleton className="h-32 w-full" /> : (
            <>
              <div className="space-y-3">
                {monitoringMetrics.map((metric) => {
                  const isSelected = selectedMetrics.includes(metric.id)
                  const isRecommended = aiSuggestions?.metrics.includes(metric.id);

                  return (
                    <div key={metric.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <Checkbox id={metric.id} checked={isSelected}
                                onCheckedChange={() => handleMetricToggle(metric.id)}/>
                      <Label htmlFor={metric.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{metric.label}</span>
                            <p className="text-sm text-muted-foreground">{metric.description}</p>
                          </div>
                           {isRecommended && <Badge variant="secondary">AI Pick</Badge>}
                        </div>
                      </Label>
                    </div>
                  )
                })}
              </div>

              <div className="pt-4 border-t">
                <Label htmlFor="reportingFrequency" className="text-base font-medium">
                  Reporting Frequency
                </Label>
                <Select value={reportingFrequency} onValueChange={(value) => handleUpdate({ reportingFrequency: value })}>
                  <SelectTrigger className="w-[180px] mt-2">
                    <SelectValue placeholder="Select frequency"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

