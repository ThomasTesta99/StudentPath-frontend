import { CreateButton } from '@/components/refine-ui/buttons/create'
import { ShowButton } from '@/components/refine-ui/buttons/show'
import { DataTable } from '@/components/refine-ui/data-table/data-table'
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb'
import { ListView } from '@/components/refine-ui/views/list-view'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import { Department } from '@/types'
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from '@tanstack/react-table'
import { Search } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'

const DepartmentsList = () => {

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const searchFilters = debouncedQuery ? [
        {field: "name", operator: "contains" as const, value: debouncedQuery}
    ] : [];

    const departmentTable = useTable<Department>({
        columns: useMemo<ColumnDef<Department>[]>(() => [
            {
                id: "name", 
                accessorKey: "name", 
                size: 200, 
                header: () => <p className='column-title justifyu'>Department Name</p>,
                cell: ({getValue}) => <span className='font-semibold text-center'>{getValue<string>().toUpperCase()}</span>
            },
            {
                id: "createdAt", 
                accessorKey: "createdAt", 
                size: 150, 
                header: () => <p className='column-title'>Created At</p>,
                cell: ({getValue}) => <span className="text-muted-foreground">{formatDate(getValue<string>())}</span>
            },
            {
                id: "details", 
                size: 140,
                header: () => <p className="column-title">Details</p>,
                cell: ({ row }) => <ShowButton resource="departments" recordItemId={row.original.id} variant="outline" size="sm">View</ShowButton>
            }
            
        ], []),
        refineCoreProps: {
            resource: "departments", 
            pagination: {pageSize: 10, mode: "server"},
            filters: {
                permanent: [...searchFilters]
            }, 
            sorters: {
                initial: [
                    {field: "name", order: "desc"}
                ]
            }
        }
    })
    
    return (
        <ListView>
            <Breadcrumb />
            <h1 className="page-title">Departments</h1>
            <div className="intro-row">
                Manage departments for your shool.

                <div className="actions-row">
                    <div className="search-field">
                        <Search className='search-icon' />

                        <Input 
                            type='text'
                            placeholder='Enter department name...'
                            className='pl-10 w-full'
                            value = {searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <CreateButton />
                    </div>
                </div>
            </div>
            <DataTable table={departmentTable} />
        </ListView>
    )
}

export default DepartmentsList
