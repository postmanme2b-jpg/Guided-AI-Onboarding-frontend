import {
  MessageSquare,
  Target,
  Users,
  FileText,
  Trophy,
  Calendar,
  ClipboardCheck,
  Megaphone,
  Eye,
} from "lucide-react"

export const stepHelpContent: Record<string, { title: string; description: string; tips: string[] }> = {
  "problem-scoping": {
    title: "Define Your Challenge Foundation",
    description: "Let's start by clearly understanding the problem you want to solve. This foundation will guide every aspect of your challenge.",
    tips: [
      "Be specific about the problem you're trying to solve",
      "Provide context about why this matters now",
      "Think about the impact of solving this problem",
    ],
  },
  "challenge-type": {
    title: "Choose Your Challenge Format",
    description: "Based on your problem, I'll recommend the best challenge type from Wazoku's proven formats.",
    tips: [
      "Each type has different submission requirements",
      "Consider your timeline and resources",
      "Think about your audience's capabilities",
    ],
  },
  "audience-registration": {
    title: "Define Your Participants",
    description: "Who should participate in your challenge? Let's configure the right audience and registration settings.",
    tips: [
      "Consider both internal and external participants",
      "Think about team vs individual submissions",
      "Decide on approval requirements for quality control",
    ],
  },
  "submission-requirements": {
    title: "Set Clear Expectations",
    description: "What should participants submit? Clear requirements lead to better submissions.",
    tips: [
      "Be specific about deliverable formats",
      "Provide clear guidelines and examples",
      "Consider what's realistic for your timeline",
    ],
  },
  "prize-configuration": {
    title: "Design Your Rewards",
    description: "Motivate participants with meaningful rewards that align with your goals and budget.",
    tips: [
      "Consider both monetary and recognition rewards",
      "Think about multiple prize tiers",
      "Align rewards with your expected outcomes",
    ],
  },
  "timeline-milestones": {
    title: "Plan Your Schedule",
    description: "Set realistic timelines that give participants enough time while maintaining momentum.",
    tips: [
      "Allow time for promotion before launch",
      "Consider participant availability",
      "Plan for evaluation and winner announcement",
    ],
  },
  "evaluation-criteria": {
    title: "Define Success Metrics",
    description: "How will you judge submissions? Clear criteria ensure fair and effective evaluation.",
    tips: [
      "Align criteria with your problem statement",
      "Consider feasibility and impact",
      "Make criteria transparent to participants",
    ],
  },
  "communications-monitoring": {
    title: "Promote and Track",
    description: "Plan how you'll promote your challenge and monitor its progress throughout.",
    tips: [
      "Use multiple channels for maximum reach",
      "Plan regular updates during the challenge",
      "Monitor engagement and adjust if needed",
    ],
  },
  "review-launch": {
    title: "Final Review",
    description: "Review all your settings and launch your challenge with confidence.",
    tips: [
      "Double-check all dates and requirements",
      "Ensure your team is ready to support participants",
      "Have a communication plan ready",
    ],
  },
};

export const steps = [
  { id: "problem-scoping", title: "Problem Scoping", description: "Define the core problem", icon: MessageSquare },
  { id: "challenge-type", title: "Challenge Type", description: "Select the best format", icon: Target },
  { id: "audience-registration", title: "Audience & Registration", description: "Define participants", icon: Users },
  { id: "submission-requirements", title: "Submission Requirements", description: "Set submission guidelines", icon: FileText },
  { id: "prize-configuration", title: "Prize Configuration", description: "Configure rewards", icon: Trophy },
  { id: "timeline-milestones", title: "Timeline & Milestones", description: "Set dates and duration", icon: Calendar },
  { id: "evaluation-criteria", title: "Evaluation Criteria", description: "Define judging criteria", icon: ClipboardCheck },
  { id: "communications-monitoring", title: "Communications & Monitoring", description: "Plan promotion", icon: Megaphone },
  { id: "review-launch", title: "Review & Launch", description: "Final review and launch", icon: Eye },
]
