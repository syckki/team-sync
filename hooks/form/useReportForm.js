import { useMachine } from "@xstate/react";

import reportFormMachine, {
  getNewRow,
} from "../../machines/reportForm/reportForm.setup";

const useReportFormMachine = ({
  readOnly = false,
  initialReportData = null,
}) => {
  const [state, send] = useMachine(reportFormMachine, {
    input: {
      reportData: initialReportData,
      isReadOnly: readOnly,
      rows: [getNewRow()],
    },
  });

  const sendEvent = (type, data) => send({ type, data });

  return {
    // Form state
    teamMember: state.context.teamMember,
    setTeamMember: (name) => {
      sendEvent("UPDATE_FIELD", { field: "teamMember", value: name });
    },
    teamRole: state.context.teamRole,
    setTeamRole: (name) => {
      sendEvent("UPDATE_FIELD", { field: "teamRole", value: name });
    },
    isReadOnly: state.context.isReadOnly,
    rows: state.context.rows,
    expandedRows: state.context.expandedRows,

    referenceData: state.context.referenceData,

    // Row operations
    handleSDLCStepChange: (id, value) => {
      sendEvent("UPDATE_ROW", { id, field: "sdlcStep", value });
    },
    handleRowChange: (id, field, value) => {
      sendEvent("UPDATE_ROW", { id, field, value });
    },
    toggleRowExpansion: (id) => {
      sendEvent("TOGGLE_ROW_EXPANSION", { id });
    },
    addRow: () => {
      sendEvent("ADD_ROW");
    },
    removeRow: (id) => {
      sendEvent("REMOVE_ROW", { id });
    },

    // Form processing
    submitReport: (mode, teamName, threadId, keyFragment, messageIndex) =>
      sendEvent("SUBMIT_REPORT", {
        mode,
        teamName,
        threadId,
        keyFragment,
        messageIndex,
      }),

    // Submission state
    error: state.context.error,
    success: state.matches("success"),
    isSubmitting: state.matches("submitting"),
  };
};

export default useReportFormMachine;
