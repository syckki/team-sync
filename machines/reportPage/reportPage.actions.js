import { assign } from "xstate";

export const setReportList = assign((_, { output }) => {
  return { ...output };
});

export const notifyError = assign({
  error: ({ event }) => event.error,
});
