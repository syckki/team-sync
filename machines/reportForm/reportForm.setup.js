import { createReportFormMachine } from "./reportForm.machine";

import {
  fetchReferenceData,
  submitReport,
  updateReferenceData,
} from "./reportForm.actors";

import {
  processReportData,
  updateField,
  addRow,
  removeRow,
  updateRow,
  toggleRowExpansion,
  setReferenceData,
  notifyError,
  getNewRow,
} from "./reportForm.actions";

const reportFormMachine = createReportFormMachine({
  actors: {
    fetchReferenceData,
    submitReport,
    updateReferenceData,
  },
  actions: {
    setReferenceData,
    processReportData,
    updateField,
    addRow,
    removeRow,
    updateRow,
    toggleRowExpansion,
    notifyError,
  },
  guards: {
    notReadOnly: ({ context }) => !context.isReadOnly,
    isFormValid: ({ context }) => {
      const hasTeamMember = context.teamMember.trim();
      const hasTeamRole = context.teamRole.trim();
      const hasRows = context.rows.length > 0;
      const hasRequiredInRows = context.rows.every(
        (row) =>
          row.platform &&
          row.projectInitiative &&
          row.sdlcStep &&
          row.sdlcTask &&
          row.taskCategory &&
          row.estimatedTimeWithoutAI &&
          row.actualTimeWithAI &&
          row.complexity &&
          row.qualityImpact &&
          row.aiToolsUsed &&
          row.taskDetails,
      );

      return hasTeamMember && hasTeamRole && hasRows && hasRequiredInRows;
    },
  },
});

export { getNewRow };
export default reportFormMachine;
