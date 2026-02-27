import { CreateButton } from '@/components/refine-ui/buttons/create';
import { ShowButton } from '@/components/refine-ui/buttons/show';
import { DataTable } from '@/components/refine-ui/data-table/data-table';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { ListView } from '@/components/refine-ui/views/list-view';
import { Input } from '@/components/ui/input';
import { StudentProfile } from '@/types';
import { useTable } from '@refinedev/react-table';
import { ColumnDef } from '@tanstack/react-table';
import { Search } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react'

const StudentsList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState("");

    useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
    }, [searchQuery]);

    const searchFilters = debouncedQuery ? [
        {field: 'search', operator: "contains" as const, value: debouncedQuery}
    ] : [];

    const studentTable = useTable<StudentProfile>({
        columns: useMemo<ColumnDef<StudentProfile>[]>(() => [
            {
                id: "name", 
                accessorFn: (row) => row.user.name ?? "",
                size: 120, 
                header: () => <p className='column-title'>Name</p>,
                cell: ({row}) => (
                    <span>{row.original.user.name ?? "-"}</span>
                )
            }, 
            {
                id: "email",
                accessorFn: (row) => row.user.email ?? "",
                size: 150, 
                header: () => <p className='column-title'>Email</p>,
                cell: ({row}) => (
                    <span>{row.original.user.email ?? "-"}</span>
                )
            },
            {
                id: "osis", 
                accessorKey: "osis", 
                size: 100, 
                header: () => <p className='column-title'>OSIS</p>,
                cell: ({getValue}) => <span>{getValue<string>()}</span>
            },
            {
                id: "gradeLevel", 
                accessorKey: "gradeLevel", 
                size: 50, 
                header: () => <p className='column-title'>Grade</p>,
                cell: ({getValue}) => <span>{getValue<string>()}</span>
            },
            {
                id: "details", 
                size: 100, 
                header: () => <p className='column-title'>Details</p>,
                cell: ({row}) => <ShowButton resource='teachers' recordItemId={row.original.userId} variant="outline" size="sm">View</ShowButton>
            },
        ], []), 
        refineCoreProps: {
            resource: "students",
             pagination: {
            pageSize: 10, 
            mode: "server", 
        }, 
        filters: {
            permanent: [...searchFilters]
        }
        }
    })


    return (
        <ListView>
            <Breadcrumb/>
            <h1 className="page-title">Students</h1>
            <div className="intro-row">
                <p>Manage students in your school.</p>
                <div className="actions-row">
                    <div className="search-field">
                        <Search className='search-icon'/>
                        <Input 
                            type='text'
                            placeholder='Search students'
                            className='pl-10 w-full'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <CreateButton />
                    </div>
                </div>
            </div>
            <DataTable table={studentTable} />
        </ListView>
    )
}

export default StudentsList
