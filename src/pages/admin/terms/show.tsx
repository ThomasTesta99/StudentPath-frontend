import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCustomMutation, useNotification, useShow } from "@refinedev/core";
import React from "react";
import { BACKEND_BASE_URL } from "@/constants";

function formatDate(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-base font-medium">{value}</div>
    </div>
  );
}

const TermsShow = () => {

  const { query } = useShow({
    resource: "terms",
  });

  const {mutate: customMutate, mutation} = useCustomMutation();
  const isToggling = mutation.isPending;
  const {open} = useNotification();

  const term = query.data?.data;

  if (query.isLoading) return <div className="p-6">Loading...</div>;
  if (query.isError) return <div className="p-6">Failed to load term</div>;
  if (!term) return <div className="p-6">No term found.</div>;

  const start = term.startDate ? new Date(term.startDate) : null;
  const end = term.endDate ? new Date(term.endDate) : null;

  const isActive = Boolean(term.isActive);

  const handleToggleActive = () => {
    const action = isActive ? "deactivate" : "activate";

    customMutate(
      {
        url: `${BACKEND_BASE_URL}/admin/terms/${term.id}/${action}`, 
        method: "patch", 
        values: {},
      },
      {
        onSuccess: () => {
          open?.({
            type: "success", 
            message: `Term ${isActive ? "deactivated" : "activated"} successfully`,
          })

          query.refetch();
        },
        onError: (error) => {
          open?.({
            type: "error", 
            message: "Action failed", 
            description: error?.message ?? "Could not update term"
          })
        }
      }
    )
  }

  return (
    <div className="w-full">
      <ShowView className="space-y-6">
        
        <ShowViewHeader resource="terms" title="Term Details" />

        <Separator />

        <div className="mx-auto w-full max-w-5xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-2xl font-bold leading-tight">
                      {term.termName}
                    </CardTitle>

                    <Badge variant={isActive ? "default" : "secondary"}>
                      {isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Term overview and key details.
                  </div>
                </CardHeader>

                <CardContent className="gap-6 space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <Field label="School ID" value={term.schoolId ?? "—"} />
                    <Field label="School Name" value={term.school?.schoolName ?? "—"} />
                    
                  </div>
                  <Field label="Term ID" value={term.id ?? "—"} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dates</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Field label="Start date" value={formatDate(start)} />
                  <Field label="End date" value={formatDate(end)} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Field
                    label="Current"
                    value={
                      <div className="flex items-center gap-2">
                        <Badge variant={isActive ? "default" : "secondary"}>
                          {isActive ? "Active" : "Inactive"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {isActive ? "Used for current scheduling" : "Not currently in use"}
                        </span>
                      </div>
                    }
                  />

                  <Field
                    label="Created"
                    value={term.createdAt ? formatDate(new Date(term.createdAt)) : "—"}
                  />
                  <Field
                    label="Updated"
                    value={term.updatedAt ? formatDate(new Date(term.updatedAt)) : "—"}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center justify-end">
                  <Button
                    variant={isActive ? "outline" : "default"}
                    className="w-full"
                    onClick={handleToggleActive}
                    disabled={isToggling}
                  >
                    {isToggling ? "Saving" : isActive ? "Deactivate" : "Activate"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ShowView>
    </div>
  );
};

export default TermsShow;
