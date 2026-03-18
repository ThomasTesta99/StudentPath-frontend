import { formatDate } from '@/lib/utils'
import { TeacherSectionDetail } from '@/types'
import React from 'react'

const PrintRosterTable = ({section}: {section: TeacherSectionDetail}) => {
  return (
    <div>
      <h1 className="text-2xl font-bold">
            Class Roster
        </h1>

        <p className="mt-1 text-sm text-black/70">
            Printed on {formatDate(new Date().toISOString())}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div>
                <span className="font-semibold">Course:</span>{" "}
                <span>{section?.course?.name ?? "—"}</span>
            </div>

            <div>
                <span className="font-semibold">Teacher:</span>{" "}
                <span>{section?.teacher?.user?.name ?? "—"}</span>
            </div>

            <div>
                <span className="font-semibold">Section:</span>{" "}
                <span>{section?.sectionLabel ?? "—"}</span>
            </div>

            <div>
                <span className="font-semibold">Room:</span>{" "}
                <span>{section?.roomNumber ?? "—"}</span>
            </div>

            <div>
                <span className="font-semibold">Period:</span>{" "}
                <span>{section?.period?.number ?? "—"}</span>
            </div>

            <div>
                <span className="font-semibold">Term:</span>{" "}
                <span>{section?.term?.termName ?? "—"}</span>
            </div>
        </div>
    </div>
  )
}

export default PrintRosterTable
