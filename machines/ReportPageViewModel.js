import { setup } from "xstate";

import { reportPageMachine } from "./reportPage/reportPage.machine";
import { fetchReportData } from "./reportPage/reportPage.actors";
import { setReportData, notifyError } from "./reportPage/reportPage.actions";

const reportPageViewModel = setup({
  actors: {
    fetchReportData,
  },
  actions: {
    setReportData,
    notifyError,
  },
  guards: {
    modeForm: ({ context }) => context.mode === "form" && context.messageIndex,
    modeViewer: ({ context }) => context.mode === "viewer",
  },
}).createMachine(reportPageMachine);

export default reportPageViewModel;
