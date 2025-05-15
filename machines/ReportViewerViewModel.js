import { setup } from "xstate";

import { reportViewerMachine } from "./reportViewer/reportViewer.machine";
import {
  extractFilterOptions,
  updateFilter,
  updateReportType,
} from "./reportViewer/reportViewer.actions";

const reportViewerViewModel = setup({
  actions: {
    extractFilterOptions,
    updateFilter,
    updateReportType,
  },
}).createMachine(reportViewerMachine);

export default reportViewerViewModel;
