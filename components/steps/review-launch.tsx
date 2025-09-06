"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Rocket, CheckCircle, AlertCircle, Sparkles, Lightbulb } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"


interface ReviewLaunchProps {
  challengeData: any
  validationIssues: string[]
}

const challengeTypesInfo: Record<string, {name: string, description: string}> = {
    ideation: { name: "The Brainstorm", description: "Generate breakthrough ideas" },
    theoretical: { name: "The Design", description: "Submit conceptual designs" },
    rtp: { name: "The Prototype", description: "Submit working non-commercial prototypes" },
    erfp: { name: "The Collaborator", description: "Attract collaborators via structured proposals" },
    prodigy: { name: "The Algorithm", description: "Solve algorithmic problems with automated scoring" },
};

const audienceTypesInfo: Record<string, string> = {
    internal: "Internal Staff",
    global: "Global Crowd",
    partners: "Partner Network",
    customers: "Customer Community",
};

const submissionTypesInfo: Record<string, string> = {
    document: "Written Document",
    presentation: "Pitch Deck",
    video: "Video Pitch",
    prototype: "Working Prototype",
    design: "Visual Design",
    concept: "Concept Only",
};

const scoringModelsInfo: Record<string, string> = {
    weighted: "Weighted Scoring",
    checklist: "Checklist Evaluation",
    feedback: "Open Feedback",
};

const promotionChannelsInfo: Record<string, string> = {
    email: "Email Campaign",
    social: "Social Media",
    intranet: "Company Intranet",
    website: "Website Banner",
};


export function ReviewLaunch({ challengeData, validationIssues }: ReviewLaunchProps) {
    const { toast } = useToast();

    const getSectionStatus = (sectionKey: string) => {
        const section = challengeData[sectionKey];
        if (!section || !section.completed) return "incomplete";
        return "complete";
    };

  const sections = [
    { key: "problem-scoping", title: "Problem Scoping" },
    { key: "challenge-type", title: "Challenge Type" },
    { key: "audience-registration", title: "Audience & Registration" },
    { key: "submission-requirements", title: "Submission Requirements" },
    { key: "prize-configuration", title: "Prize Configuration" },
    { key: "timeline-milestones", title: "Timeline & Milestones" },
    { key: "evaluation-criteria", title: "Evaluation Criteria" },
    { key: "communications-monitoring", title: "Communications & Monitoring" },
  ]

  const completedSections = sections.filter((section) => getSectionStatus(section.key) === "complete").length
  const completionPercentage = Math.round((completedSections / sections.length) * 100)

    const handleLaunch = () => {
        toast({
            title: "Challenge Launched!",
            description: "Your challenge has been successfully launched.",
        });
    };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Challenge Summary</CardTitle>
          <CardDescription>Review your complete challenge configuration below. You can go back to any step to make changes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completion Status</span>
              <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
                {completedSections}/{sections.length} steps complete
              </Badge>
            </div>

            <div className="space-y-3">
              {sections.map((section) => {
                const status = getSectionStatus(section.key)
                const isComplete = status === "complete"

                return (
                  <div key={section.key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {isComplete ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                      )}
                      <span className="font-medium">{section.title}</span>
                    </div>
                    <Badge variant={isComplete ? "default" : "outline"}>{isComplete ? "Complete" : "Incomplete"}</Badge>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Review & Suggestions
          </CardTitle>
          <CardDescription>
            Our AI has analyzed your configuration for potential issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {validationIssues.length === 0 ? (
             <div className="flex items-center text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                No issues detected. Your challenge setup looks great!
             </div>
          ) : (
            <ul className="space-y-3">
              {validationIssues.map((issue, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <Lightbulb className="h-4 w-4 mt-0.5 text-purple-500 flex-shrink-0" />
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>


        {/* Problem Scoping Summary */}
        {challengeData['problem-scoping'] && (
             <Card>
                <CardHeader>
                    <CardTitle>1. Problem Scoping</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <h3 className="font-semibold">Refined Problem Statement</h3>
                    <p className="text-muted-foreground">{challengeData['problem-scoping'].refinedStatement}</p>
                </CardContent>
            </Card>
        )}

        {/* Challenge Type Summary */}
        {challengeData['challenge-type'] && (
            <Card>
                <CardHeader><CardTitle>2. Challenge Type</CardTitle></CardHeader>
                <CardContent>
                    <h3 className="font-semibold">{challengeTypesInfo[challengeData['challenge-type'].selectedType]?.name}</h3>
                    <p className="text-muted-foreground">{challengeTypesInfo[challengeData['challenge-type'].selectedType]?.description}</p>
                </CardContent>
            </Card>
        )}

        {/* Audience Summary */}
        {challengeData['audience-registration'] && (
            <Card>
                <CardHeader><CardTitle>3. Audience & Registration</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-semibold mb-2">Target Audience</h3>
                        <div className="flex flex-wrap gap-1">
                            {challengeData['audience-registration'].audiences?.map((a: string) => <Badge key={a} variant="secondary">{audienceTypesInfo[a] || a}</Badge>)}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold">Participation Type</h3>
                        <p className="text-muted-foreground capitalize">{challengeData['audience-registration'].participationType}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Registration Approval</h3>
                        <p className="text-muted-foreground">{challengeData['audience-registration'].registrationSettings?.requireApproval ? "Required" : "Not Required"}</p>
                    </div>
                </CardContent>
            </Card>
        )}

        {/* Submission Requirements Summary */}
        {challengeData['submission-requirements'] && (
            <Card>
                <CardHeader><CardTitle>4. Submission Requirements</CardTitle></CardHeader>
                <CardContent>
                    <h3 className="font-semibold mb-2">Accepted Formats</h3>
                    <div className="flex flex-wrap gap-1">
                       {challengeData['submission-requirements'].types?.map((t: string) => <Badge key={t} variant="secondary">{submissionTypesInfo[t] || t}</Badge>)}
                    </div>
                </CardContent>
            </Card>
        )}

        {/* Prize Configuration Summary */}
        {challengeData['prize-configuration'] && (
            <Card>
                <CardHeader><CardTitle>5. Prize Configuration</CardTitle></CardHeader>
                <CardContent>
                    <h3 className="font-semibold">Prize Type</h3>
                    <p className="text-muted-foreground capitalize">{challengeData['prize-configuration'].prizeType}</p>
                    {challengeData['prize-configuration'].totalBudget && (
                        <>
                            <h3 className="font-semibold mt-4">Total Budget</h3>
                            <p className="text-muted-foreground">${challengeData['prize-configuration'].totalBudget}</p>
                        </>
                    )}
                </CardContent>
            </Card>
        )}

        {/* Timeline Summary */}
        {challengeData['timeline-milestones'] && (
            <Card>
                <CardHeader><CardTitle>6. Timeline & Milestones</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-semibold">Start Date</h3>
                        <p className="text-muted-foreground">{challengeData['timeline-milestones'].startDate}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">End Date</h3>
                        <p className="text-muted-foreground">{challengeData['timeline-milestones'].endDate}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Duration</h3>
                        <p className="text-muted-foreground">{challengeData['timeline-milestones']?.duration || 'Not Set'}</p>
                    </div>
                </CardContent>
            </Card>
        )}

        {/* Evaluation Criteria Summary */}
        {challengeData['evaluation-criteria'] && (
            <Card>
                <CardHeader><CardTitle>7. Evaluation Criteria</CardTitle></CardHeader>
                <CardContent>
                    <h3 className="font-semibold">Scoring Model</h3>
                    <p className="text-muted-foreground">{scoringModelsInfo[challengeData['evaluation-criteria'].model]}</p>
                </CardContent>
            </Card>
        )}

        {/* Communications & Monitoring Summary */}
        {challengeData['communications-monitoring'] && (
            <Card>
                <CardHeader><CardTitle>8. Communications & Monitoring</CardTitle></CardHeader>
                <CardContent>
                    <h3 className="font-semibold mb-2">Promotion Channels</h3>
                    <div className="flex flex-wrap gap-1">
                       {challengeData['communications-monitoring'].channels?.map((c: string) => <Badge key={c} variant="secondary">{promotionChannelsInfo[c] || c}</Badge>)}
                    </div>
                </CardContent>
            </Card>
        )}


      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-1">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Ready to Launch!</span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400">
                    Your challenge is {completionPercentage}% complete.
                    </p>
                </div>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                <div>
                    <p className="font-semibold">{challengeTypesInfo[challengeData['challenge-type']?.selectedType]?.name || 'Not Set'}</p>
                    <p className="text-muted-foreground text-xs">Challenge Type</p>
                </div>
                 <div>
                    <p className="font-semibold">{challengeData['timeline-milestones']?.duration || 'Not Set'}</p>
                    <p className="text-muted-foreground text-xs">Duration</p>
                </div>
                <div>
                    <p className="font-semibold">{challengeData['prize-configuration']?.totalBudget ? `$${challengeData['prize-configuration'].totalBudget}` : 'N/A'}</p>
                    <p className="text-muted-foreground text-xs">Prize Budget</p>
                </div>
                <div>
                    <p className="font-semibold">{challengeData['audience-registration']?.audiences?.length || 0} Groups</p>
                    <p className="text-muted-foreground text-xs">Target Audience</p>
                </div>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}
