import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb'
import { CreateView} from '@/components/refine-ui/views/create-view'
import { Separator } from '@/components/ui/separator'
import React from 'react'

const CreateAssignment = () => {
    return (
        <CreateView>
            <Breadcrumb />
            <h1 className="page-title">Create Assignment</h1>
            <p>Create an assignment for one or more sections within the same course.</p>
            <Separator />
        </CreateView>
    )
}

export default CreateAssignment
