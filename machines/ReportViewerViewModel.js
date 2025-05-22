import { setup } from "xstate";

import { reportViewerMachine } from "./reportViewer/reportViewer.machine";
import { extractFilterOptions, updateFilter } from "./reportViewer/reportViewer.actions";

const reportViewerViewModel = setup({
  actions: {
    extractFilterOptions,
    updateFilter,
  },
  guards: {
    selectedReportIsRaw: ({ event }) => {
      return event.data.reportType === "raw";
    },
    selectedReportIsAiImpactSummary: ({ event }) => {
      return event.data.reportType === "aiImpactSummary";
    },
  },
}).createMachine(reportViewerMachine);

export default reportViewerViewModel;
