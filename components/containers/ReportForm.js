import React from "react";
import { useRouter } from "next/router";
import { useState } from "react";
import ReportFormComponent from "../presentational/ReportForm";

const ReportForm = ({ keyFragment, teamName, teamMemberOptions }) => {
  const router = useRouter();
  
  // Just pass props to the presentational component for now
  // Later, we can add form state management here
  
  return (
    <ReportFormComponent 
      keyFragment={keyFragment}
      teamName={teamName}
      teamMemberOptions={teamMemberOptions}
    />
  );
};

export default ReportForm;