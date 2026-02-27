import { CreateButton } from '@/components/refine-ui/buttons/create'
import { ShowButton } from '@/components/refine-ui/buttons/show'
import { DataTable } from '@/components/refine-ui/data-table/data-table'
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb'
import { ListView } from '@/components/refine-ui/views/list-view'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import { TeacherProfile } from '@/types'
import { useTable } from '@refinedev/react-table'
import { ColumnDef } from '@tanstack/react-table'
import { Search } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'

const TeacherList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchFilters = debouncedQuery ? [
    {field: 'search', operator: "contains" as const, value: debouncedQuery}
  ] : [];

  const teacherTabe = useTable<TeacherProfile>({
    columns: useMemo<ColumnDef<TeacherProfile>[]>(() => [
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
        id: "createdAt", 
        accessorKey: "createdAt",
        size: 120,
        header: () => <p className='column-title'>Created</p>,
        cell: ({getValue}) => <span>{formatDate(getValue<string>())}</span>
      },
      {
        id: "details", 
        size: 100, 
        header: () => <p className='column-title'>Details</p>,
        cell: ({row}) => <ShowButton resource='teachers' recordItemId={row.original.userId} variant="outline" size="sm">View</ShowButton>
      }
    ], []),
    refineCoreProps: {
      resource: "teachers", 
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
      <Breadcrumb />
      <h1 className="page-title">Teachers</h1>
      <div className="intro-row">
        <p>Manage teachers for your school.</p>
        <div className="actions-row">
          <div className="search-field">
            <Search className='search-icon' />

            <Input 
              type='text'
              placeholder='Search teacher...'
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
      <DataTable table={teacherTabe} />
    </ListView>
  )
}

export default TeacherList
