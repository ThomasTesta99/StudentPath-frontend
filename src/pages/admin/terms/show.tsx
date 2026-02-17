import { useShow } from "@refinedev/core";
import React from "react";

const TermsShow = () => {
  const { query } = useShow({
    resource: "terms",
  });

  const term = query.data?.data;

  const start = term?.startDate ? new Date(term.startDate) : null;
  const end = term?.endDate ? new Date(term.endDate) : null;

  if (query.isLoading) return <div>Loading...</div>;
  if (query.isError) return <div>Failed to load term</div>;

  return (
    <div>
      <div>{term?.termName}</div>
      <div>{term?.schoolId}</div>
      <div>{start ? start.toDateString() : ""}</div>
      <div>{end ? end.toDateString() : ""}</div>
      <div>{String(term?.isActive)}</div>
    </div>
  );
};

export default TermsShow;
