import React from 'react'
import { CreateButton } from '../refine-ui/buttons/create'

const AssignmentsList = ({sectionId} : {sectionId: string}) => {
  return (
    <div>
      assignments
      <CreateButton resource='assignments' meta={{query: {sectionId: sectionId}}}/>
    </div>
  )
}

export default AssignmentsList
