import { CreateButton } from '@/components/refine-ui/buttons/create';
import { ShowButton } from '@/components/refine-ui/buttons/show';
import { DataTable } from '@/components/refine-ui/data-table/data-table';
import { ListView } from '@/components/refine-ui/views/list-view';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Course, Department} from '@/types';
import { useList } from '@refinedev/core';
import { useTable } from '@refinedev/react-table';
import { ColumnDef } from '@tanstack/react-table';
import { Search } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react'

const CoursesList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("all");

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const searchFilters = debouncedQuery ? [
        {field: 'search', operator: "contains" as const, value: debouncedQuery}
    ] : [];

    const departmentFilters = selectedDepartmentId === "all"
        ? [] 
        : [
            {
                field: "departmentId", 
                operator: "eq" as const, 
                value: selectedDepartmentId
            }
        ]

    const coursesList = useTable({
        columns: useMemo<ColumnDef<Course>[]>(() => [
            {
                id: "code", 
                accessorKey: "code", 
                size: 80, 
                header: () => <p className='column-title'>Course Code</p>,
                cell: ({getValue}) => <Badge>{getValue<string>()}</Badge>
            },
            {
                id: "courseName", 
                accessorKey: "name",
                size: 150, 
                header: () => <p className='column-title'>Course Name</p>,
                cell: ({getValue}) => <span>{getValue<string>()}</span>
            },
            {
                id: "department", 
                accessorFn: (row) => row.department?.name ?? "-", 
                size: 120, 
                header: () => <p className='column-title'>Department</p>,
                cell: ({row}) => (
                    <span>{row.original.department?.name ?? "-"}</span>
            )
            }, 
            {
                id: "details", 
                size: 50,
                header: () => <p className="column-title">Details</p>,
                cell: ({ row }) => <ShowButton resource="courses" recordItemId={row.original.id} variant="outline" size="sm">View</ShowButton>
            }
        ], []),
        refineCoreProps: {
            resource: "courses", 
            pagination: {
                pageSize: 10, 
                mode: "off", 
            }, 
            filters: {
                permanent: [...searchFilters, ...departmentFilters]
            }
        }
    });

    const {query: departmentsQuery} = useList<Department>({
        resource: "departments",
        pagination: {
            mode: "off",
        }
    });

    return (
        <ListView>
            <Breadcrumb/>
            <h1 className="page-title">Courses</h1>
            <div className="intro-row">
                <p>Manage courses in your school.</p>
                <div className="actions-row">
                    <div className="search-field">
                        <Search className='search-icon'/>
                        <Input 
                            type='text'
                            placeholder='Search courses'
                            className='pl-10 w-full'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId} disabled={departmentsQuery.isLoading || departmentsQuery.isError}>
                            <SelectTrigger className='cursor-pointer'>
                                <SelectValue placeholder="Filter by department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all' className='cursor-pointer'>All Departments</SelectItem>
                                {departmentsQuery.isLoading && (
                                    <SelectItem value="loading" disabled>
                                        Loading departments...
                                    </SelectItem>
                                )}

                                {departmentsQuery.isError && (
                                    <SelectItem value="error" disabled>
                                        Failed to load departments
                                    </SelectItem>
                                )}

                                {!departmentsQuery.isLoading &&
                                    !departmentsQuery.isError &&
                                    departmentsQuery.data?.data?.map((department) => (
                                        <SelectItem key={department.id} value={department.id} className='cursor-pointer'>
                                            {department.name}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                        <CreateButton />
                    </div>
                </div>
            </div>
            <DataTable table={coursesList} />
        </ListView>
     )
}

export default CoursesList
