import { setup } from "xstate";
import { aiImpactSummaryMachine } from "./aiImpactSummary/aiImpactSummary.machine";
import { processReports } from "./aiImpactSummary/aiImpactSummary.actions";

const aiImpactSummaryViewModel = setup({
  actions: {
    processReports,
  },
}).createMachine(aiImpactSummaryMachine);

export default aiImpactSummaryViewModel;
