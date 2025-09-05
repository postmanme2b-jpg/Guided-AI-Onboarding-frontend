import { Info, HelpCircle } from "lucide-react"

interface StepHeaderProps {
  title: string
  description: string
  tips: string[]
}

export function StepHeader({ title, description, tips }: StepHeaderProps) {
  return (
    <div className="mb-8 p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex-shrink-0">
          <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-xl text-gray-900 dark:text-gray-100 mb-2">{title}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
          <div className="space-y-2">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-500">
                <Info className="h-3.5 w-3.5 mt-0.5 text-blue-500 flex-shrink-0" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
