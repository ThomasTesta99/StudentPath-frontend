import { CreateButton } from '@/components/refine-ui/buttons/create'
import { DataTable } from '@/components/refine-ui/data-table/data-table'
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb'
import { ListView } from '@/components/refine-ui/views/list-view'
import { Input } from '@/components/ui/input'
import { Terms } from '@/types'
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from '@tanstack/react-table'
import { Search } from 'lucide-react'
import { Badge } from "@/components/ui/badge";
import React, { useMemo, useState } from 'react'
import { formatDate } from '@/lib/utils'
import { ShowButton } from '@/components/refine-ui/buttons/show'

const TermsList = () => {
  const [searchQuery, setsearchQuery] = useState('');

  const searchFilters = searchQuery ? [
    {field: 'termName', operator: "contains" as const, value: searchQuery}
  ] : [];

  const termTable = useTable<Terms>({
    columns: useMemo<ColumnDef<Terms>[]>(() => [
      {
        id: 'termName',
        accessorKey: 'termName',
        size: 200,  
        header: () => <p className="column-title">Term Name</p>,
        cell: ({getValue}) => <span className="text-foreground">{getValue<string>()}</span>,
        filterFn: 'includesString',
      },
      {
        id: "startDate", 
        accessorKey: "startDate", 
        size: 150, 
        header: () => <p className="column-title tabular-nums">Start Date</p>,
        cell: ({getValue}) => <span className="text-muted-foreground">{formatDate(getValue<string>())}</span>
      },
      {
        id: "endDate", 
        accessorKey: "endDate", 
        size: 150, 
        header: () => <p className="column-title tabular-nums">End Date</p>,
        cell: ({getValue}) => <span className="text-muted-foreground">{formatDate(getValue<string>())}</span>
      },
      {
        id: "isActive", 
        accessorKey: "isActive", 
        size: 110, 
        header: () => <p className="column-title text-center">Is Active</p>,
        cell: ({getValue}) => {
          const active = getValue<boolean>();
          return (
            <Badge
              variant={active ? "default" : "secondary"}
              className="gap-2"
            >
              <span
                className={`h-2 w-2 rounded-full ${active ? "bg-green-500" : "bg-gray-400"}`}
              />
              {active ? "Active" : "Inactive"}
            </Badge>
          );
        },
      },
      {
          id: 'details',
          size: 140,
          header: () => <p className="column-title">Details</p>,
          cell: ({ row }) => <ShowButton resource="terms" recordItemId={row.original.id} variant="outline" size="sm">View</ShowButton>
        }
    ], []), 
    refineCoreProps : {
      resource: "terms",
      pagination: {pageSize: 10, mode: "server"},
      filters: {
        permanent: [...searchFilters]
      },
      sorters: {
        initial: [
          {field: 'id', order: "desc"}
        ]
      },
    }
  });

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Terms</h1>

      <div className="intro-row">
        <p>Manage academic terms for your school. <br /> Create new terms, set the active term, and update term dates as needed.</p>

        <div className="actions-row">
          <div className="search-field">
            <Search className='search-icon'/>

            <Input 
              type='text' 
              placeholder='Search by term name...' 
              className='pl-10 w-full'
              value = {searchQuery}
              onChange={(e) => setsearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <CreateButton />
          </div>
        </div>
      </div>

      <DataTable table={termTable}/>
    </ListView>
  )
}

export default TermsList
