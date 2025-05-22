import { assign } from "xstate";

// Extract unique filter options from the reports
export const extractFilterOptions = assign((_, { reportList: reports }) => {
  const options = {
    teamMembers: new Set(),
    teamRoles: new Set(),
    platforms: new Set(),
    sdlcSteps: new Set(),
    sdlcTasks: new Set(),
  };

  reports.forEach((report) => {
    // Add team member and role
    if (report.teamMember) options.teamMembers.add(report.teamMember);
    if (report.teamRole) options.teamRoles.add(report.teamRole);

    // Add platforms, SDLC steps, and SDLC tasks from each entry
    report.entries.forEach((entry) => {
      if (entry.platform) options.platforms.add(entry.platform);
      if (entry.sdlcStep) options.sdlcSteps.add(entry.sdlcStep);
      if (entry.sdlcTask) options.sdlcTasks.add(entry.sdlcTask);
    });
  });

  // Convert Sets to sorted Arrays
  return {
    filterOptions: {
      teamMembers: Array.from(options.teamMembers).sort(),
      teamRoles: Array.from(options.teamRoles).sort(),
      platforms: Array.from(options.platforms).sort(),
      sdlcSteps: Array.from(options.sdlcSteps).sort(),
      sdlcTasks: Array.from(options.sdlcTasks).sort(),
    },
  };
});

export const updateFilter = assign((_, { filters, filterName, value }) => {
  return {
    filters: {
      ...filters,
      [filterName]: value,
    },
  };
});
