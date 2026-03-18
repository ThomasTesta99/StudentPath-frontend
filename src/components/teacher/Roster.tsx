import { TeacherRosterRow, TeacherSectionDetail } from "@/types";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import React, { useMemo, useRef } from "react";
import { DataTable } from "../refine-ui/data-table/data-table";
import { formatDate, formatNameLastFirst } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import PrintRosterTable from "./PrintRosterTable";

const Roster = ({ section }: { section: TeacherSectionDetail }) => {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: "Class Roster",
    });

    const rosterTable = useTable<TeacherRosterRow>({
        columns: useMemo<ColumnDef<TeacherRosterRow>[]>(() => [
            {
                id: "number",
                header: () => <p className="column-title">No.</p>,
                size: 30,
                cell: ({ row }) => <span>{row.index + 1}</span>,
            },
            {
                id: "name",
                accessorKey: "name",
                size: 140,
                header: () => <p className="column-title">Name</p>,
                cell: ({ getValue }) => {
                    const name = getValue<string>();
                    return <span>{formatNameLastFirst(name)}</span>;
                },
            },
            {
                id: "osis",
                accessorKey: "osis",
                size: 100,
                header: () => <p className="column-title">OSIS</p>,
                cell: ({ getValue }) => <span>{getValue<string>()}</span>,
            },
            {
                id: "gradeLevel",
                accessorKey: "gradeLevel",
                size: 100,
                header: () => <p className="column-title">Grade</p>,
                cell: ({ getValue }) => <span>{getValue<string>()}</span>,
            },
            {
                id: "enrollmentCreatedAt",
                accessorKey: "enrollmentCreatedAt",
                size: 120,
                header: () => <p className="column-title">Enrolled At</p>,
                cell: ({ getValue }) => (
                    <span>{formatDate(getValue<string>())}</span>
                ),
            },
        ], []),
        refineCoreProps: {
            resource: "classes",
            meta: { path: `teacher/sections/${section.id}/students` },
        },
    });

    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-4 print:hidden">
                <CardTitle className="text-xl">Class Roster</CardTitle>

                <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2"
                >
                    <Printer className="h-4 w-4" />
                    Print
                </Button>
            </CardHeader>

            <CardContent className="pt-0">
                <div ref={printRef} className="print:p-8">
                    <div className="hidden print:block mb-6 border-b border-black pb-4 text-black">
                        <PrintRosterTable section={section}/>
                    </div>

                    <div>
                        <DataTable table={rosterTable} hidePagination={true} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default Roster;