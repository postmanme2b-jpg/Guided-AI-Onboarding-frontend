"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Users, Globe, Building, UserCheck } from "lucide-react"

interface TargetAudienceProps {
  onComplete: (data: any) => void
  data: any
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

export function TargetAudience({ onComplete, data }: TargetAudienceProps) {
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>(data.audiences || [])
  const [participationType, setParticipationType] = useState(data.participationType || "individual")
  const [requirements, setRequirements] = useState({
    minAge: data.requirements?.minAge || false,
    location: data.requirements?.location || false,
    expertise: data.requirements?.expertise || false,
  })

  useEffect(() => {
    if (selectedAudiences.length > 0) {
      onComplete({
        audiences: selectedAudiences,
        participationType,
        requirements,
      })
    }
  }, [selectedAudiences, participationType, requirements, onComplete])

  const handleAudienceToggle = (audienceId: string) => {
    setSelectedAudiences((prev) =>
      prev.includes(audienceId) ? prev.filter((id) => id !== audienceId) : [...prev, audienceId],
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            Who do you want to participate?
          </CardTitle>
          <CardDescription>
            Select your target audience to help us structure communication and eligibility requirements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {audienceTypes.map((audience) => {
              const Icon = audience.icon
              const isSelected = selectedAudiences.includes(audience.id)

              return (
                <div
                  key={audience.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    isSelected ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                  }`}
                  onClick={() => handleAudienceToggle(audience.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox checked={isSelected} onChange={() => handleAudienceToggle(audience.id)} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{audience.label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{audience.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {selectedAudiences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Participation Type</CardTitle>
            <CardDescription>How should participants be able to submit their ideas?</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={participationType} onValueChange={setParticipationType}>
              {participationTypes.map((type) => (
                <div key={type.id} className="flex items-start space-x-3 space-y-0">
                  <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor={type.id} className="font-medium">
                      {type.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {selectedAudiences.length > 0 && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-3">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Ready
              </Badge>
              <span className="text-sm font-medium">Target audience selected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedAudiences.map((audienceId) => {
                const audience = audienceTypes.find((a) => a.id === audienceId)
                return audience ? (
                  <Badge key={audienceId} variant="outline" className="text-xs">
                    {audience.label}
                  </Badge>
                ) : null
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
