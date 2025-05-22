import { assign } from "xstate";

// Process data by time periods (week, month, quarter)
const processPeriodData = (entries, periodType) => {
  const periodMap = {};

  entries.forEach((entry) => {
    const date = new Date(entry.timestamp);
    let periodKey;

    if (periodType === "week") {
      // Get ISO week number (1-52)
      const weekNumber = getISOWeek(date);
      periodKey = `Week ${weekNumber}, ${date.getFullYear()}`;
    } else if (periodType === "month") {
      // Get month name and year
      periodKey = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;
    } else if (periodType === "quarter") {
      // Get quarter and year
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      periodKey = `Q${quarter} ${date.getFullYear()}`;
    }

    if (!periodMap[periodKey]) {
      periodMap[periodKey] = {
        period: periodKey,
        totalHours: 0,
        totalHoursSaved: 0,
        entryCount: 0,
      };
    }

    const hours = parseFloat(entry.hours) || 0;
    const hoursSaved = parseFloat(entry.hoursSaved) || 0;

    periodMap[periodKey].totalHours += hours;
    periodMap[periodKey].totalHoursSaved += hoursSaved;
    periodMap[periodKey].entryCount += 1;
  });

  // Convert to array and sort by time period
  return Object.values(periodMap)
    .map((period) => ({
      ...period,
      productivityRatio:
        period.totalHours > 0 ? (period.totalHoursSaved / period.totalHours) * 100 : 0,
    }))
    .sort((a, b) => {
      // Sort by period (assuming format that allows string comparison)
      return a.period.localeCompare(b.period);
    });
};

// Process data by platform
const processPlatformData = (entries) => {
  const platformMap = {};

  entries.forEach((entry) => {
    const platform = entry.platform || "Not Specified";

    if (!platformMap[platform]) {
      platformMap[platform] = {
        platform,
        totalHours: 0,
        totalHoursSaved: 0,
        entryCount: 0,
      };
    }

    const hours = parseFloat(entry.hours) || 0;
    const hoursSaved = parseFloat(entry.hoursSaved) || 0;

    platformMap[platform].totalHours += hours;
    platformMap[platform].totalHoursSaved += hoursSaved;
    platformMap[platform].entryCount += 1;
  });

  // Convert to array and sort by total hours saved (descending)
  return Object.values(platformMap)
    .map((platform) => ({
      ...platform,
      productivityRatio:
        platform.totalHours > 0 ? (platform.totalHoursSaved / platform.totalHours) * 100 : 0,
    }))
    .sort((a, b) => b.totalHoursSaved - a.totalHoursSaved);
};

// Process data by SDLC step
const processSdlcData = (entries) => {
  const sdlcMap = {};

  entries.forEach((entry) => {
    const sdlcStep = entry.sdlcStep || "Not Specified";

    if (!sdlcMap[sdlcStep]) {
      sdlcMap[sdlcStep] = {
        sdlcStep,
        totalHours: 0,
        totalHoursSaved: 0,
        entryCount: 0,
        tasks: {},
      };
    }

    const hours = parseFloat(entry.hours) || 0;
    const hoursSaved = parseFloat(entry.hoursSaved) || 0;

    sdlcMap[sdlcStep].totalHours += hours;
    sdlcMap[sdlcStep].totalHoursSaved += hoursSaved;
    sdlcMap[sdlcStep].entryCount += 1;

    // Track task-level metrics within this SDLC step
    const task = entry.sdlcTask || "Not Specified";
    if (!sdlcMap[sdlcStep].tasks[task]) {
      sdlcMap[sdlcStep].tasks[task] = {
        task,
        totalHours: 0,
        totalHoursSaved: 0,
        entryCount: 0,
      };
    }

    sdlcMap[sdlcStep].tasks[task].totalHours += hours;
    sdlcMap[sdlcStep].tasks[task].totalHoursSaved += hoursSaved;
    sdlcMap[sdlcStep].tasks[task].entryCount += 1;
  });

  // Convert to array and sort by total hours saved (descending)
  return Object.values(sdlcMap)
    .map((sdlc) => ({
      ...sdlc,
      productivityRatio: sdlc.totalHours > 0 ? (sdlc.totalHoursSaved / sdlc.totalHours) * 100 : 0,
      // Convert tasks object to array
      tasks: Object.values(sdlc.tasks)
        .map((task) => ({
          ...task,
          productivityRatio:
            task.totalHours > 0 ? (task.totalHoursSaved / task.totalHours) * 100 : 0,
        }))
        .sort((a, b) => b.totalHoursSaved - a.totalHoursSaved),
    }))
    .sort((a, b) => b.totalHoursSaved - a.totalHoursSaved);
};

// Helper function to get ISO week number
const getISOWeek = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

export const processReports = assign((_, { reports, filters }) => {
  // Filter reports based on selected criteria
  const filteredReports = reports.filter((report) => {
    if (filters.teamMember && report.teamMember !== filters.teamMember) {
      return false;
    }
    if (filters.teamRole && report.teamRole !== filters.teamRole) {
      return false;
    }
    return true;
  });

  // Extract all entries from all reports
  const allEntries = filteredReports.flatMap((report) =>
    report.entries.map((entry) => ({
      ...entry,
      teamMember: report.teamMember,
      teamRole: report.teamRole,
      timestamp: report.timestamp,
    }))
  );

  // Filter entries based on additional criteria in filters
  const filteredEntries = allEntries.filter((entry) => {
    if (filters.sdlcStep && entry.sdlcStep !== filters.sdlcStep) {
      return false;
    }
    if (filters.sdlcTask && entry.sdlcTask !== filters.sdlcTask) {
      return false;
    }
    if (filters.platform && entry.platform !== filters.platform) {
      return false;
    }
    return true;
  });

  // Calculate overall summary metrics
  const summary = {
    totalHours: 0,
    totalHoursSaved: 0,
    averageProductivity: 0,
    totalEntries: filteredEntries.length,
    productivityRatio: 0,
  };

  filteredEntries.forEach((entry) => {
    const hours = parseFloat(entry.hours) || 0;
    const hoursSaved = parseFloat(entry.hoursSaved) || 0;

    summary.totalHours += hours;
    summary.totalHoursSaved += hoursSaved;
  });

  // Calculate derived metrics
  summary.averageProductivity =
    summary.totalEntries > 0 ? summary.totalHoursSaved / summary.totalEntries : 0;

  summary.productivityRatio =
    summary.totalHours > 0 ? (summary.totalHoursSaved / summary.totalHours) * 100 : 0;

  // Group data by time periods (week, month, quarter)
  const periodType = filters.periodType || "week";
  const periodData = processPeriodData(filteredEntries, periodType);

  // Group data by platform
  const platformData = processPlatformData(filteredEntries);

  // Group data by SDLC step
  const sdlcData = processSdlcData(filteredEntries);

  // Update state with processed data
  return {
    reportData: {
      summary,
      periodData,
      platformData,
      sdlcData,
    },
  };
});
