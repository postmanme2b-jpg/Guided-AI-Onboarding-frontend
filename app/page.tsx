"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/sidebar"
import { ProblemScoping } from "@/components/steps/problem-scoping"
import { ChallengeTypeRecommendation } from "@/components/steps/challenge-type-recommendation"
import { AudienceRegistration } from "@/components/steps/audience-registration"
import { SubmissionRequirements } from "@/components/steps/submission-requirements"
import { PrizeConfiguration } from "@/components/steps/prize-configuration"
import { TimelineMilestones } from "@/components/steps/timeline-milestones"
import { EvaluationCriteria } from "@/components/steps/evaluation-criteria"
import { CommunicationsMonitoring } from "@/components/steps/communications-monitoring"
import { ReviewLaunch } from "@/components/steps/review-launch"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Rocket, CheckCircle, AlertTriangle } from "lucide-react"
import { steps, stepHelpContent } from "@/lib/content"
import { StepHeader } from "@/components/step-header"
import { v4 as uuidv4 } from 'uuid';
import { useDebounce } from "@/hooks/use-debounce"


export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [challengeData, setChallengeData] = useState<Record<string, any>>({})
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const [validationIssues, setValidationIssues] = useState<string[]>([])
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  const wsUrl = process.env.NEXT_PUBLIC_WS_BASE_URL || "ws://localhost:8000";

  // Debounce the challengeData state. The API call will only be made
  // after the user has stopped typing/interacting for 1 second.
  const debouncedChallengeData = useDebounce(challengeData, 1000);

  useEffect(() => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);

    const socket = new WebSocket(`${wsUrl}/ws?session=${newSessionId}`);
    socketRef.current = socket;

    socket.onopen = () => {
        console.log("WebSocket connection established");
    };

    socket.onmessage = (event) => {
        const messageContent = event.data;
        let aiMessage;

        try {
            const parsedContent = JSON.parse(messageContent);
            aiMessage = {
                id: Date.now().toString(),
                type: 'ai',
                content: parsedContent.message,
                data: parsedContent,
                timestamp: new Date()
            };
        } catch (error) {
             aiMessage = {
                id: Date.now().toString(),
                type: 'ai',
                content: messageContent,
                timestamp: new Date()
            };
        }
        setMessages(prev => [...prev, aiMessage]);
    };

    socket.onclose = () => {
        console.log("WebSocket connection closed");
    };

    socket.onerror = (error) => {
        console.error("WebSocket error:", error);
    };

    return () => {
        socket.close();
    };
  }, []);

  // Use useCallback to stabilize the function reference across re-renders.
  const updateChallengeData = useCallback((stepId: string, data: any) => {
    setChallengeData((prev) => ({
      ...prev,
      [stepId]: data,
    }));
  }, []);

  // This useEffect now depends on the debounced data, preventing excessive API calls.
  useEffect(() => {
    const validateCurrentState = async () => {
        if (Object.keys(debouncedChallengeData).length === 0) return

        try {
            const response = await fetch(`${apiUrl}/api/validate-challenge`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ challenge_data: debouncedChallengeData }),
            });
            if (response.ok) {
                const result = await response.json();
                setValidationIssues(result.warnings || []);
            }
        } catch (error) {
            console.error("Validation error:", error);
        }
    };

    validateCurrentState();
  }, [debouncedChallengeData]);


  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
        const newChallengeData = { ...challengeData };
        for (let i = currentStep - 1; i < steps.length; i++) {
            const stepIdToClear = steps[i].id;
            if (newChallengeData[stepIdToClear]) {
                delete newChallengeData[stepIdToClear].completed;
            }
        }
        setChallengeData(newChallengeData);
        setCurrentStep(currentStep - 1);
    }
  }

  const handleStepSelect = (stepIndex: number) => {
     const isStepCompletedOrCurrent = Object.values(challengeData)
        .slice(0, stepIndex)
        .every(step => step.completed);

    if (stepIndex <= currentStep || isStepCompletedOrCurrent) {
        if (stepIndex < currentStep) {
            const newChallengeData = { ...challengeData };
            for (let i = stepIndex; i < steps.length; i++) {
                 const stepIdToClear = steps[i].id;
                 if (newChallengeData[stepIdToClear]) {
                    delete newChallengeData[stepIdToClear].completed;
                 }
            }
            setChallengeData(newChallengeData);
        }
        setCurrentStep(stepIndex);
    }
  }

  const completedStepsCount = Object.keys(challengeData).filter(key => challengeData[key]?.completed).length;
  const progress = (completedStepsCount / (steps.length -1) ) * 100;


  const renderStepComponent = () => {
    const stepId = steps[currentStep].id
    const stepData = challengeData[stepId] || {}
    const helpInfo = stepHelpContent[stepId];

    const component = (() => {
        switch (stepId) {
            case "problem-scoping":
                return <ProblemScoping
                            onComplete={handleNext}
                            onUpdateData={(data) => updateChallengeData(stepId, data)}
                            data={{...stepData}}
                            socket={socketRef.current}
                            messages={messages}
                            setMessages={setMessages}
                        />
            case "challenge-type":
                return <ChallengeTypeRecommendation
                            onComplete={handleNext}
                            onUpdateData={(data) => updateChallengeData(stepId, data)}
                            data={stepData}
                            problemStatement={challengeData["problem-scoping"] || {}}
                        />
            case "audience-registration":
                return <AudienceRegistration
                           onUpdateData={(data) => updateChallengeData(stepId, data)}
                           data={stepData}
                           problemStatement={challengeData["problem-scoping"] || {}}
                           challengeType={challengeData["challenge-type"] || {}}
                        />
            case "submission-requirements":
                return <SubmissionRequirements
                           onUpdateData={(data) => updateChallengeData(stepId, data)}
                           data={stepData}
                           problemStatement={challengeData["problem-scoping"] || {}}
                           challengeType={challengeData["challenge-type"] || {}}
                        />
            case "prize-configuration":
                return <PrizeConfiguration
                           onUpdateData={(data) => updateChallengeData(stepId, data)}
                           data={stepData}
                           problemStatement={challengeData["problem-scoping"] || {}}
                           challengeType={challengeData["challenge-type"] || {}}
                        />
            case "timeline-milestones":
                return <TimelineMilestones
                            onUpdateData={(data) => updateChallengeData(stepId, data)}
                            data={stepData}
                            problemStatement={challengeData["problem-scoping"] || {}}
                            challengeType={challengeData["challenge-type"] || {}}
                       />
            case "evaluation-criteria":
                return <EvaluationCriteria
                            onUpdateData={(data) => updateChallengeData(stepId, data)}
                            data={stepData}
                            problemStatement={challengeData["problem-scoping"] || {}}
                            challengeType={challengeData["challenge-type"] || {}}
                        />
            case "communications-monitoring":
                return <CommunicationsMonitoring
                            onUpdateData={(data) => updateChallengeData(stepId, data)}
                            data={stepData}
                            problemStatement={challengeData["problem-scoping"] || {}}
                            challengeType={challengeData["challenge-type"] || {}}
                        />
            case "review-launch":
                return <ReviewLaunch onComplete={handleNext} challengeData={challengeData} />
            default:
                return <div>Unknown Step</div>
        }
    })();

    return (
        <>
            {helpInfo && <StepHeader {...helpInfo} />}
            {component}
        </>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">
        <Sidebar>
          <SidebarHeader>
             <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Wazoku Challenge
             </h1>
             <p className="text-sm text-muted-foreground">AI-Guided Onboarding Wizard</p>
          </SidebarHeader>
           <SidebarContent>
            <div className="mb-4 px-2">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {completedStepsCount}/{steps.length - 1}
                    </span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>
             {validationIssues.length > 0 && (
                <div className="px-2 mb-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/50 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            <h3 className="font-semibold text-sm text-orange-800 dark:text-orange-200">AI Warnings</h3>
                        </div>
                        <ul className="space-y-1.5 list-disc pl-4">
                            {validationIssues.map((issue, index) => (
                                <li key={index} className="text-xs text-orange-700 dark:text-orange-300">{issue}</li>
                            ))}
                        </ul>
                    </div>
                </div>
             )}
            <SidebarMenu>
              {steps.map((step, index) => {
                 const isCompleted = challengeData[step.id]?.completed
                 const Icon = step.icon
                 return(
                    <SidebarMenuItem key={step.id}>
                        <SidebarMenuButton
                        onClick={() => handleStepSelect(index)}
                        isActive={currentStep === index}
                        disabled={index > completedStepsCount + 1 && index !== currentStep}
                        className="h-auto"
                        >
                        {isCompleted ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /> : <Icon className="h-5 w-5 flex-shrink-0" />}
                         <div className="flex-1 min-w-0 text-left">
                            <div className="font-medium text-sm">{step.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{step.description}</div>
                        </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                 )
              })}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
            <main className="flex-1 flex flex-col">
                <div className="flex-1 w-full p-8 overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                        {renderStepComponent()}
                    </div>
                </div>
                <footer className="border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-sidebar/80 backdrop-blur-sm p-4 sticky bottom-0">
                    <div className="max-w-4xl mx-auto flex justify-between items-center">
                        <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                        </Button>
                        <div className="text-sm text-muted-foreground">
                        Step {currentStep + 1} of {steps.length}
                        </div>
                        {currentStep === steps.length - 1 ? (
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => alert("Challenge Launched!")}>
                            <Rocket className="h-4 w-4 mr-2" />
                            Launch Challenge
                        </Button>
                        ) : (
                        <Button onClick={handleNext}
                        disabled={!challengeData[steps[currentStep].id]?.completed}
                        >
                            Next
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                        )}
                    </div>
                </footer>
            </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

