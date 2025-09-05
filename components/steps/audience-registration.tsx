"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Globe, Building, UserCheck, Sparkles, Settings } from "lucide-react"
import { useAiRecommendations } from "@/hooks/useAiRecommendations"

interface AudienceRegistrationProps {
  onUpdateData: (data: any) => void;
  data: any;
  problemStatement: any;
  challengeType: any;
}

const audienceTypes = [
  { id: "internal", label: "Internal Staff", description: "Employees within your organization", icon: Building },
  { id: "global", label: "Global Crowd", description: "Open to anyone worldwide", icon: Globe },
  { id: "partners", label: "Partner Network", description: "Trusted partners and collaborators", icon: UserCheck },
  { id: "customers", label: "Customer Community", description: "Your existing customers", icon: Users },
]

const participationTypes = [
  { id: "individual", label: "Individual Submissions", description: "Participants submit individually" },
  { id: "team", label: "Team Submissions", description: "Participants can form teams" },
  { id: "both", label: "Both Individual & Team", description: "Allow both submission types" },
]

const LoadingState = () => (
    <div className="space-y-4">
        <div className="p-4 bg-muted/80 border border-primary/10 rounded-lg">
            <Skeleton className="h-4 w-1/4 mb-2" />
            <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-4 space-y-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                </Card>
            ))}
        </div>
    </div>
);


export function AudienceRegistration({ onUpdateData, data, problemStatement, challengeType }: AudienceRegistrationProps) {
  // Controlled: read everything from parent data
  const selectedAudiences: string[] = data.audiences || [];
  const participationType: string = data.participationType || "individual";
  const registrationSettings = data.registrationSettings || {
    requireApproval: false,
    maxParticipants: "",
    registrationDeadline: "",
  };

  const { data: aiSuggestions, isLoading: isGenerating } = useAiRecommendations<{ audiences: string[], participationType: string, aiCommentary: string }>({
    endpoint: "audience-recommendations",
    payload: {
      problem_statement: problemStatement.problemStatement,
      challenge_type: challengeType.selectedType,
    },
    enabled: !!problemStatement?.problemStatement && !!challengeType?.selectedType,
  });

  // Pre-fill with AI suggestions (only first time if no data exists)
  useEffect(() => {
    if (aiSuggestions && !data.audiences) {
      onUpdateData({
        ...data,
        audiences: aiSuggestions.audiences,
        participationType: aiSuggestions.participationType,
        completed: aiSuggestions.audiences.length > 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiSuggestions]);

  const handleAudienceToggle = (audienceId: string) => {
    const updatedAudiences = selectedAudiences.includes(audienceId)
      ? selectedAudiences.filter((id) => id !== audienceId)
      : [...selectedAudiences, audienceId];

    onUpdateData({
      ...data,
      audiences: updatedAudiences,
      completed: updatedAudiences.length > 0,
    });
  };

  const handleParticipationChange = (value: string) => {
    onUpdateData({
      ...data,
      participationType: value,
      completed: selectedAudiences.length > 0,
    });
  };

  const handleRegistrationSettingsChange = (updates: Partial<typeof registrationSettings>) => {
    const updatedSettings = { ...registrationSettings, ...updates };
    onUpdateData({
      ...data,
      registrationSettings: updatedSettings,
      completed: selectedAudiences.length > 0,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Who do you want to participate?
          </CardTitle>
          <CardDescription>
            Select your target audience. This will help structure communication and eligibility.
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
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {aiSuggestions.aiCommentary}
                    </p>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                {audienceTypes.map((audience) => {
                  const Icon = audience.icon
                  const isSelected = selectedAudiences.includes(audience.id)
                  const isRecommended = aiSuggestions?.audiences.includes(audience.id);

                  return (
                    <div
                      key={audience.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors relative ${
                        isSelected ? "border-primary bg-primary/10 ring-2 ring-primary" : "hover:border-primary/50"
                      }`}
                      onClick={() => handleAudienceToggle(audience.id)}
                    >
                      {isRecommended && <Badge className="absolute -top-2 -right-2">AI Pick</Badge>}
                      <div className="flex items-start gap-3">
                        <Checkbox checked={isSelected} onCheckedChange={() => handleAudienceToggle(audience.id)} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="h-5 w-5" />
                            <span className="font-medium">{audience.label}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{audience.description}</p>
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
            <CardTitle>Participation Type</CardTitle>
            <CardDescription>How should participants be able to submit their ideas?</CardDescription>
        </CardHeader>
        <CardContent>
          {isGenerating ? <Skeleton className="h-24 w-full" /> : (
             <RadioGroup value={participationType} onValueChange={handleParticipationChange} className="space-y-2">
              {participationTypes.map((type) => (
                <Label key={type.id} htmlFor={type.id} className="flex items-start space-x-3 space-y-0 border rounded-md p-4 cursor-pointer has-[:checked]:bg-secondary has-[:checked]:border-primary/50">
                  <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                  <div className="space-y-1">
                    <span className="font-medium">{type.label}</span>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                </Label>
              ))}
            </RadioGroup>
            )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Registration Settings
          </CardTitle>
          <CardDescription>Configure how participants can register for your challenge.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requireApproval"
                  checked={registrationSettings.requireApproval}
                  onCheckedChange={(checked) =>
                    handleRegistrationSettingsChange({ requireApproval: checked as boolean })
                  }
                />
                <Label htmlFor="requireApproval" className="flex items-center gap-2">
                  Should registration require approval?
                </Label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="maxParticipants">Maximum Participants (optional)</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    placeholder="No limit"
                    value={registrationSettings.maxParticipants}
                    onChange={(e) =>
                      handleRegistrationSettingsChange({ maxParticipants: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="registrationDeadline">Registration Deadline (optional)</Label>
                  <Input
                    id="registrationDeadline"
                    type="date"
                    value={registrationSettings.registrationDeadline}
                    onChange={(e) =>
                      handleRegistrationSettingsChange({ registrationDeadline: e.target.value })
                    }
                  />
                </div>
              </div>
            </>
        </CardContent>
      </Card>
    </div>
  )
}

