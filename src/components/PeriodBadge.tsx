import React from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

const PeriodBadge = ({
    periodNumber, 
    startTime, 
    endTime
}: {
    periodNumber: number, 
    startTime: string, 
    endTime: string
}) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span
                        tabIndex={0}
                        className="inline-flex min-w-[96px] cursor-default items-center justify-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary shadow-sm transition-all duration-200 hover:border-primary/30 hover:bg-primary/15 hover:shadow-md"
                    >
                    {periodNumber ? `Period ${periodNumber}` : "—"}
                </span>
            </TooltipTrigger>

            <TooltipContent
                side="top"
                className="rounded-xl border border-border/60 bg-popover px-4 py-3 shadow-xl"
            >
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Period Time
                    </p>

                    {startTime || endTime ? (
                        <div className="space-y-1">
                            {startTime && (
                                <div className="flex items-center justify-between gap-4 text-sm">
                                    <span className="text-muted-foreground">Starts</span>
                                    <span className="font-medium text-foreground">{startTime}</span>
                                </div>
                            )}
                            {endTime && (
                                <div className="flex items-center justify-between gap-4 text-sm">
                                    <span className="text-muted-foreground">Ends</span>
                                    <span className="font-medium text-foreground">{endTime}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No time available
                        </p>
                    )}
                </div>
            </TooltipContent>
        </Tooltip>
    )
}

export default PeriodBadge
