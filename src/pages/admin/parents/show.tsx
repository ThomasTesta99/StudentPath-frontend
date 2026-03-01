import { DeleteButton } from '@/components/refine-ui/buttons/delete';
import { ShowView, ShowViewHeader } from '@/components/refine-ui/views/show-view';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { capitalizeFirst, formatDate } from '@/lib/utils';
import { Field } from '@/lib/utilsTsx';
import { ParentProfile } from '@/types';
import { useGo, useShow } from '@refinedev/core'
import React from 'react'
import { useParams } from 'react-router';

const ShowParent = () => {
    const go = useGo();
    const {id} = useParams();

    const {query} = useShow<ParentProfile>({
        resource: "parents", 
        id: id, 
    });

    const parent = query?.data?.data;
    if(query.isLoading || query.isError || !parent){
        return (
            <ShowView>
                <ShowViewHeader resource="parents" title="Parent Details" />
                <p className="text-sm text-muted-foreground">
                    {query.isLoading
                    ? "Loading parent details..."
                    : query.isError
                    ? "Failed to load parent details."
                    : "Parent details not found."}
                </p>
                </ShowView>
        )
    }
    return (
        <ShowView>
            <ShowViewHeader resource='parents' title='Parent Details' />
            <Separator />

            <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-2xl font-bold leading-tight">
                          {parent.user.name ?? "-"}
                      </CardTitle>

                      <div className="flex gap-2">
                          <Badge variant={parent.user.emailVerified ? "default" : "secondary"}>
                            {parent.user.emailVerified ? "Email Verified" : "Email Unverified"}
                          </Badge>

                      </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                      Parent profile and account details.
                  </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Field label="Email" value={parent.user.email} />
                  <Field label="Profile Role" value={capitalizeFirst(parent.user.profileRole)} />
                  <Field label="System Role" value={capitalizeFirst(parent.user.role)} />
                  <Field label="User ID" value={parent.userId} />
                  <Field label="School ID" value={parent.schoolId} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dates</CardTitle>
              </CardHeader>

              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Field label="Parent Profile Created" value={formatDate(parent.createdAt)} />
                <Field label="Parent Profile Updated" value={formatDate(parent.updatedAt)} />
                <Field label="User Created" value={formatDate(parent.user.createdAt)} />
                <Field label="User Updated" value={formatDate(parent.user.updatedAt)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>

              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Deleting this parent will permanently remove their account.
                </p>

                <div className="flex justify-end">
                  <DeleteButton
                    resource="parents"
                    recordItemId={parent.userId}
                    onSuccess={() => {
                      go({
                          to: {
                              resource: "parents",
                              action: "list",
                          },
                          type: "replace",
                      });
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
        </ShowView>
    )
}

export default ShowParent
