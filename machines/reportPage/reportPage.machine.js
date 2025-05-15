import ReportFormViewModel, { getNewRow } from "../ReportFormViewModel";

export const reportPageMachine = {
  id: "reportPage",
  initial: "loading",
  context: ({ input }) => ({
    key: input.key,
    threadId: input.threadId,
    authorId: input.authorId,
    messageIndex: input.messageIndex,
    teamName: "",
    reportData: null,
    isReadOnly: false,
    mode: input.mode, // "form" | "viewer"

    error: null,
  }),
  states: {
    loading: {
      invoke: {
        id: "fetchReportData",
        src: "fetchReportData",
        input: ({ context }) => ({
          key: context.key,
          mode: context.mode,
          threadId: context.threadId,
          authorId: context.authorId,
          messageIndex: context.messageIndex,
        }),
        onDone: {
          target: "deciding",
          actions: [
            {
              type: "setReportData",
              params: ({ event }) => ({
                output: event.output,
              }),
            },
          ],
        },
        onError: "failure",
      },
    },
    deciding: {
      always: [
        {
          guard: "modeForm",
          target: "form",
        },
        {
          guard: "modeViewer",
          target: "viewer",
        },
      ],
    },
    form: {
      invoke: {
        id: "reportForm",
        src: ReportFormViewModel,
        input: ({ context }) => ({
          key: context.key,
          threadId: context.threadId,
          authorId: context.authorId,
          messageIndex: context.messageIndex,
          teamName: context.teamName,
          reportData: context.reportData,
          isReadOnly: context.isReadOnly,
          rows: [getNewRow()],
        }),
      },
    },
    viewer: {
      /*invoke: {
        id: "reportViewer",
        src: reportViewerMachine,
        input: ({ context }) => ({
          reportData: context.reportData,
        }),
      },*/
    },
    failure: {},
  },
};
