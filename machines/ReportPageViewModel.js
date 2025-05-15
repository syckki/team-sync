import { setup } from "xstate";

import { reportPageMachine } from "./reportPage/reportPage.machine";
import { fetchReportList } from "./reportPage/reportPage.actors";
import { setReportList, notifyError } from "./reportPage/reportPage.actions";

const reportPageViewModel = setup({
  actors: {
    fetchReportList,
  },
  actions: {
    setReportList,
    notifyError,
  },
  guards: {
    modeForm: ({ context }) => context.mode === "form" && context.messageIndex,
    modeViewer: ({ context }) => context.mode === "viewer",
  },
}).createMachine(reportPageMachine);

export default reportPageViewModel;
