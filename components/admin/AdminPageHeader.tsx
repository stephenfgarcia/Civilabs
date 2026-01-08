import { MagneticButton } from '@/components/ui/magnetic-button'
import { LucideIcon } from 'lucide-react'

interface AdminPageHeaderProps {
  title: string
  description: string
  gradient: string
  borderColor: string
  actionButton?: {
    label: string
    icon: LucideIcon
    onClick: () => void
    disabled?: boolean
  }
}

export function AdminPageHeader({
  title,
  description,
  gradient,
  borderColor,
  actionButton,
}: AdminPageHeaderProps) {
  return (
    <div className="admin-item opacity-0">
      <div className={`glass-effect concrete-texture rounded-xl p-8 relative overflow-hidden border-4 ${borderColor}`}>
        <div className={`absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 ${borderColor.replace('border-', 'border-')}`}></div>
        <div className={`absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 ${borderColor.replace('border-', 'border-')}`}></div>
        <div className={`absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 ${borderColor.replace('border-', 'border-')}`}></div>
        <div className={`absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 ${borderColor.replace('border-', 'border-')}`}></div>

        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-10`}></div>
        <div className="absolute inset-0 blueprint-grid opacity-20"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-2`}>
                {title}
              </h1>
              <p className="text-lg font-bold text-neutral-700">
                {description}
              </p>
            </div>

            {actionButton && (
              <MagneticButton
                onClick={actionButton.onClick}
                disabled={actionButton.disabled}
                className={`bg-gradient-to-r ${gradient} text-white font-black`}
              >
                <actionButton.icon className="mr-2" size={20} />
                {actionButton.label}
              </MagneticButton>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
