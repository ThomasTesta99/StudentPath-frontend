import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import React from 'react'

export type EnrollmentTab = "course" | "student"

const EnrollmentTabs = ({
    activeTab, 
    onChange 
} : {
    activeTab: EnrollmentTab, 
    onChange: (tab: EnrollmentTab) => void
}) => {
    const tabs: {key: EnrollmentTab; label: string}[] = [
        {key: "course", label: "Course"},
        {key: "student", label: "Student"},
    ]
    
    return (
        <div className='flex items-center gap-6'>
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    type='button'
                    onClick={() => onChange(tab.key)}
                    className={cn(
                        "relative pb-3 font-medium transition-colors cursor-pointer",
                        activeTab === tab.key
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    {tab.label}
                    {activeTab === tab.key && (
                            <motion.div
                                layoutId="enrollment-tab-underline"
                                className="absolute bottom-0 left-0 h-0.5 w-full bg-primary"
                                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                            />
                        )}
                </button>
            ))}
            
        </div>
    )
}

export default EnrollmentTabs