export const reportFormMachine = {
  id: "reportForm",
  initial: "loading",
  context: ({ input }) => ({
    key: input.key,
    threadId: input.threadId,
    authorId: input.authorId,
    reportIndex: input.reportIndex,
    teamName: input.teamName,
    teamMember: "",
    teamRole: "",
    rows: input.rows,
    expandedRows: {},
    reportData: input.reportData,
    referenceData: {
      platforms: [],
      projectInitiatives: [],
      sdlcSteps: [],
      sdlcTasksMap: {},
      taskCategories: [],
      complexityLevels: [],
      qualityImpacts: [],
      aiTools: [],
      teamRoles: [],
      teamMembers: [],
    },
    isReadOnly: input.isReadOnly,

    error: null,
  }),
  states: {
    // Loading reference data and processing report data
    loading: {
      invoke: {
        id: "fetchReferenceData",
        src: "fetchReferenceData",
        onDone: {
          target: "ready",
          actions: "setReferenceData",
        },
        onError: {
          target: "failure",
          actions: "notifyError",
        },
      },
      entry: [
        {
          type: "processReportData",
          params: ({ context }) => ({ reportData: context.reportData }),
        },
      ],
    },
    // Ready state (ready for user interaction)
    ready: {
      initial: "idle",
      states: {
        idle: {},
        dirty: {
          tags: ["formModified"],
        },
      },
      on: {
        UPDATE_FIELD: {
          guard: "notReadOnly",
          actions: [
            {
              type: "updateField",
              params: ({ event }) => ({ ...event.data }),
            },
          ],
          target: ".dirty",
        },
        ADD_ROW: {
          guard: "notReadOnly",
          actions: [
            {
              type: "addRow",
              params: ({ context }) => ({
                rows: context.rows,
                expandedRows: context.expandedRows,
              }),
            },
          ],
        },
        REMOVE_ROW: {
          guard: "notReadOnly",
          actions: [
            {
              type: "removeRow",
              params: ({ context, event }) => ({
                rows: context.rows,
                expandedRows: context.expandedRows,
                ...event.data,
              }),
            },
          ],
          target: ".dirty",
        },
        UPDATE_ROW: {
          guard: "notReadOnly",
          actions: [
            {
              type: "updateRow",
              params: ({ context, event }) => ({
                rows: context.rows,
                ...event.data,
              }),
            },
          ],
          target: ".dirty",
        },
        TOGGLE_ROW_EXPANSION: {
          actions: [
            {
              type: "toggleRowExpansion",
              params: ({ context, event }) => ({
                expandedRows: context.expandedRows,
                ...event.data,
              }),
            },
          ],
        },
        SUBMIT_REPORT: {
          guard: "isFormValid",
          target: "submitting",
        },
      },
    },
    submitting: {
      invoke: [
        {
          id: "updateReferenceData",
          src: "updateReferenceData",
        },
        {
          id: "submitReport",
          src: "submitReport",
          input: ({ context, event }) => ({
            key: context.key,
            threadId: context.threadId,
            authorId: context.authorId,
            reportIndex: context.reportIndex,
            teamName: context.teamName,
            teamMember: context.teamMember,
            teamRole: context.teamRole,
            rows: context.rows,
            ...event.data,
          }),
          onDone: {
            target: "success",
          },
          onError: {
            target: "ready.idle",
            actions: "notifyError",
          },
        },
      ],
    },

    success: {
      type: "final",
    },

    failure: {
      tags: ["retry"],
      on: {
        RETRY: "loading",
      },
    },
  },
};
