import aiImpactSummaryViewModel from "../AiImpactSummaryViewModel";

export const reportViewerMachine = {
  id: "reportViewer",
  initial: "loading",
  context: ({ input }) => ({
    teamName: input.teamName,
    reportList: input.reportList,
    filterOptions: {
      teamMembers: [],
      teamRoles: [],
      platforms: [],
      sdlcSteps: [],
      sdlcTasks: [],
    },
    filters: {
      teamMember: "",
      teamRole: "",
      platform: "",
      sdlcStep: "",
      sdlcTask: "",
      periodType: "week",
    },

    error: null,
  }),
  states: {
    // Extracting filter optiones from report list
    loading: {
      entry: [
        {
          type: "extractFilterOptions",
          params: ({ context }) => ({ reportList: context.reportList }),
        },
      ],
      always: [
        {
          target: "ready",
        },
      ],
    },
    // Ready state (ready for user interaction)
    ready: {
      initial: "raw",
      states: {
        raw: {},
        aiImpactSummary: {
          invoke: {
            id: "aiImpactSummary",
            src: aiImpactSummaryViewModel,
            input: ({ context }) => ({
              reports: context.reportList,
              filters: context.filters,
            }),
          },
        },
      },
      on: {
        UPDATE_FILTER: {
          actions: [
            {
              type: "updateFilter",
              params: ({ event }) => ({ ...event.data }),
            },
          ],
        },
        UPDATE_REPORT_TYPE: [
          {
            guard: "selectedReportIsRaw",
            target: "ready.raw",
          },
          {
            guard: "selectedReportIsAiImpactSummary",
            target: "ready.aiImpactSummary",
          },
        ],
      },
    },
  },
};
