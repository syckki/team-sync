import { setup } from "xstate";

import { reportFormMachine } from "./reportForm/reportForm.machine";

import {
  fetchReferenceData,
  submitReport,
  updateReferenceData,
} from "./reportForm/reportForm.actors";

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
} from "./reportForm/reportForm.actions";

const reportFormViewModel = setup({
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
}).createMachine(reportFormMachine);

export { getNewRow };
export default reportFormViewModel;
