export const aiImpactSummaryMachine = {
  id: "aiImpactSummary",
  initial: "processing",
  context: ({ input }) => ({
    reports: input.reports,
    filters: input.filters,
    reportData: {
      summary: {
        totalHours: 0,
        totalHoursSaved: 0,
        averageProductivity: 0,
        totalEntries: 0,
        productivityRatio: 0,
      },
      periodData: [],
      platformData: [],
      sdlcData: [],
    },
  }),
  states: {
    processing: {
      entry: [
        {
          type: "processReports",
          params: ({ context }) => ({
            reports: context.reports,
            filters: context.filters,
          }),
        },
      ],
      always: {
        target: "ready",
      },
    },
    ready: {
      initial: "idle",
      states: {
        idle: { type: "final" },
      },
    },
  },
};
