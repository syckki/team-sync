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
    selectedReport: "raw",

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
      always: {
        target: "ready",
      },
    },
    // Ready state (ready for user interaction)
    ready: {
      initial: "idle",
      states: {
        idle: { type: "final" },
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
        UPDATE_REPORT_TYPE: {
          actions: [
            {
              type: "updateReportType",
              params: ({ event }) => ({ ...event.data }),
            },
          ],
        },
      },
    },
  },
};
