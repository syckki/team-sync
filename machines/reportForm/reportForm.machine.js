/**
 * State machine for the Report Form
 * This defines all possible states and transitions for the form
 */
import { setup } from "xstate";

/**
 * Creates a report form state machine
 * @param {Object} context - Initial context for the state machine
 * @param {Object} contextLogic - Logic for the state machine (actions, guards...)
 * @returns {StateMachine} - XState state machine for the report form
 */
export const createReportFormMachine = (contextLogic) => {
  return setup(contextLogic).createMachine({
    id: "reportForm",
    initial: "loading",
    context: ({ input }) => ({
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
  });
};

export default createReportFormMachine;
