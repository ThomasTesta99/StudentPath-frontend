import { CreateButton } from '@/components/refine-ui/buttons/create'
import { ShowButton } from '@/components/refine-ui/buttons/show'
import { DataTable } from '@/components/refine-ui/data-table/data-table'
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb'
import { ListView } from '@/components/refine-ui/views/list-view'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Period, Section, TermDetails } from '@/types'
import { useList } from '@refinedev/core'
import { useTable } from '@refinedev/react-table'
import { ColumnDef } from '@tanstack/react-table'
import { Search } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'

const SectionsList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [selectedPeriodId, setSelectedPeriodId] = useState("all");
    const [selectedTermId, setSelectedTermId] = useState("all");

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const searchFilters = debouncedQuery ? [
        {field: 'search', operator: "contains" as const, value: debouncedQuery}
    ] : [];

    const periodFilters = selectedPeriodId === "all"
        ? [] 
        : [
            {
                field: "periodId", 
                operator: "eq" as const, 
                value: selectedPeriodId
            }
        ]

    const termFilters = selectedTermId === "all"
        ? [] 
        : [
            {
                field: "termId", 
                operator: "eq" as const, 
                value: selectedTermId
            }
        ]

    const {query: periodsQuery} = useList<Period>({
        resource: "bell-schedule/periods", 
        pagination: {
            mode: "off"
        },
        meta: {path: "admin/bell-schedule/periods"}
    });

    const {query: termsQuery} = useList<TermDetails>({
        resource: "terms", 
        pagination: {mode: "off"},
        meta: {path: "admin/terms"},
    })

    const sectionsTable = useTable<Section>({
        columns: useMemo<ColumnDef<Section>[]>(() => [
            {
                id: "sectionLabel",
                accessorKey: "sectionLabel",
                size: 80,
                header: () => <p className="column-title">Section</p>,
                cell: ({getValue}) => <span>{getValue<string>()}</span>
            },
            {
                id: "teacher",
                accessorFn: (row) => row.teacher?.name ?? "-",
                size: 60,
                header: () => <p className="column-title">Teacher</p>,
                cell: ({ row }) => <span>{row.original.teacher?.name}</span>,
            },
            {
                id: "term",
                accessorFn: (row) => row.term?.termName ?? "-",
                size: 50,
                header: () => <p className="column-title">Term</p>,
                cell: ({ row }) => <span>{row.original.term?.termName}</span>,
            },
            {
                id: "period",
                accessorFn: (row) => row.period?.number ?? "-",
                size: 50,
                header: () => <p className="column-title">Period</p>,
                cell: ({ row }) => <span>Period {row.original.period?.number}</span>,
            },
            {
                id: "capacity",
                accessorKey: "capacity", 
                size: 40,
                header: () => <p className="column-title">Capacity</p>,
                cell: ({ getValue }) => <span>{getValue<number>()}</span>,
            },
            {
                id: "roomNumber",
                accessorKey: "roomNumber",
                size: 40,
                header: () => <p className="column-title">Room</p>,
                cell: ({ getValue }) => <span>{getValue<string>() ?? "-"}</span>,
            },
            {
                id: "details", 
                size: 50,
                header: () => <p className="column-title">Details</p>,
                cell: ({ row }) => <ShowButton resource="sections" recordItemId={row.original.id} variant="outline" size="sm">View</ShowButton>
            }
        ], []),
        refineCoreProps: {
            resource: "sections",
            meta: {
                path: "admin/sections"
            },
            pagination: {
                pageSize: 10, 
                mode: "server", 
            },
            filters: {
                permanent: [...searchFilters, ...periodFilters, ...termFilters]
            },
        }
    })


    return (
        <ListView>
            <Breadcrumb />
            <h1 className="page-title">Sections</h1>
            <div className="intro-row">
                <p>Manage sections for your courses</p>
                <div className="actions-row">
                    <div className="search-field">
                        <Search className='search-icon'/>
                        <Input 
                            type='text'
                            placeholder='Search by course...'
                            className='pl-10 w-full'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId} disabled={periodsQuery.isLoading || periodsQuery.isError}>
                            <SelectTrigger className='cursor-pointer'>
                                <SelectValue placeholder="Filter by Period Number" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all' className='cursor-pointer'>All Periods</SelectItem>
                                {periodsQuery.isLoading && (
                                    <SelectItem value="loading" disabled>
                                        Loading periods...
                                    </SelectItem>
                                )}

                                {periodsQuery.isError && (
                                    <SelectItem value="error" disabled>
                                        Failed to load periods
                                    </SelectItem>
                                )}

                                {!periodsQuery.isLoading &&
                                    !periodsQuery.isError &&
                                    periodsQuery.data?.data?.map((period) => (
                                        <SelectItem key={period.id} value={period.id} className='cursor-pointer'>
                                            {period.number}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedTermId} onValueChange={setSelectedTermId} disabled={termsQuery.isLoading || termsQuery.isError}>
                            <SelectTrigger className='cursor-pointer'>
                                <SelectValue placeholder="Filter by Term" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all' className='cursor-pointer'>All Terms</SelectItem>
                                {termsQuery.isLoading && (
                                    <SelectItem value="loading" disabled>
                                        Loading terms...
                                    </SelectItem>
                                )}

                                {termsQuery.isError && (
                                    <SelectItem value="error" disabled>
                                        Failed to load terms
                                    </SelectItem>
                                )}

                                {!termsQuery.isLoading &&
                                    !termsQuery.isError &&
                                    termsQuery.data?.data?.map((term) => (
                                        <SelectItem key={term.id} value={term.id} className='cursor-pointer'>
                                            {term.termName}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                        <CreateButton />
                    </div>
                </div>
            </div>
            <DataTable table={sectionsTable} />
        </ListView>
    )
}

export default SectionsList
