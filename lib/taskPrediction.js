/**
 * Task prediction and auto-scheduling utilities
 * This module contains functions for analyzing past productivity data,
 * predicting future tasks, and suggesting optimal scheduling.
 */

/**
 * Analyzes historical task data to identify patterns for prediction
 * 
 * @param {Array} historicalTasks - Array of previous tasks with their metadata
 * @returns {Object} Patterns and metrics derived from historical data
 */
export const analyzeTaskPatterns = (historicalTasks) => {
  if (!historicalTasks || historicalTasks.length === 0) {
    return {
      taskTypeFrequency: {},
      averageDuration: {},
      platformFrequency: {},
      toolEfficiency: {},
      timeOfDay: {}
    };
  }

  // Initialize pattern accumulators
  const taskTypeCount = {};
  const taskTypeDuration = {};
  const platformCount = {};
  const aiToolEfficiency = {};
  const timeOfDayCount = {};
  
  // Process each historical task
  historicalTasks.forEach(task => {
    // Task type frequency
    const taskCategory = task.taskCategory || 'Uncategorized';
    taskTypeCount[taskCategory] = (taskTypeCount[taskCategory] || 0) + 1;
    
    // Average duration by task type
    if (!taskTypeDuration[taskCategory]) {
      taskTypeDuration[taskCategory] = {
        totalEstimated: 0,
        totalActual: 0,
        count: 0
      };
    }
    
    taskTypeDuration[taskCategory].totalEstimated += parseFloat(task.estimatedTimeWithoutAI || 0);
    taskTypeDuration[taskCategory].totalActual += parseFloat(task.actualTimeWithAI || 0);
    taskTypeDuration[taskCategory].count += 1;
    
    // Platform frequency
    const platform = task.platform || 'Unknown';
    platformCount[platform] = (platformCount[platform] || 0) + 1;
    
    // AI tool efficiency (time saved)
    if (task.aiToolsUsed && Array.isArray(task.aiToolsUsed)) {
      task.aiToolsUsed.forEach(tool => {
        if (!aiToolEfficiency[tool]) {
          aiToolEfficiency[tool] = {
            tasksUsedIn: 0,
            totalTimeSaved: 0
          };
        }
        
        const timeSaved = parseFloat(task.estimatedTimeWithoutAI || 0) - parseFloat(task.actualTimeWithAI || 0);
        aiToolEfficiency[tool].tasksUsedIn += 1;
        aiToolEfficiency[tool].totalTimeSaved += timeSaved > 0 ? timeSaved : 0;
      });
    }
    
    // Time of day pattern (if timestamp available)
    if (task.timestamp) {
      const date = new Date(task.timestamp);
      const hour = date.getHours();
      let timeSlot = 'morning';
      
      if (hour >= 12 && hour < 17) {
        timeSlot = 'afternoon';
      } else if (hour >= 17) {
        timeSlot = 'evening';
      }
      
      timeOfDayCount[timeSlot] = (timeOfDayCount[timeSlot] || 0) + 1;
    }
  });
  
  // Calculate average durations
  const averageDuration = {};
  Object.keys(taskTypeDuration).forEach(taskType => {
    const { totalEstimated, totalActual, count } = taskTypeDuration[taskType];
    averageDuration[taskType] = {
      estimated: totalEstimated / count,
      actual: totalActual / count,
      averageSavings: (totalEstimated - totalActual) / count
    };
  });
  
  // Calculate AI tool average efficiency
  const toolEfficiency = {};
  Object.keys(aiToolEfficiency).forEach(tool => {
    const { tasksUsedIn, totalTimeSaved } = aiToolEfficiency[tool];
    toolEfficiency[tool] = {
      usageCount: tasksUsedIn,
      averageTimeSaving: totalTimeSaved / tasksUsedIn
    };
  });
  
  return {
    taskTypeFrequency: taskTypeCount,
    averageDuration,
    platformFrequency: platformCount,
    toolEfficiency,
    timeOfDay: timeOfDayCount
  };
};

/**
 * Predicts task characteristics based on historical patterns
 * 
 * @param {Object} patterns - Patterns derived from historical data
 * @param {Object} currentContext - Current context (time, platform, etc.)
 * @returns {Array} Predicted task suggestions
 */
export const predictTasks = (patterns, currentContext = {}) => {
  if (!patterns || Object.keys(patterns.taskTypeFrequency).length === 0) {
    return [];
  }
  
  // Get most frequent task types (top 5)
  const sortedTaskTypes = Object.entries(patterns.taskTypeFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => entry[0]);
  
  // Get most efficient AI tools (top 3)
  const sortedTools = Object.entries(patterns.toolEfficiency)
    .sort((a, b) => b[1].averageTimeSaving - a[1].averageTimeSaving)
    .slice(0, 3)
    .map(entry => entry[0]);
  
  // Get most frequent platforms (top 3)
  const sortedPlatforms = Object.entries(patterns.platformFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => entry[0]);
  
  // Generate task predictions
  const predictions = sortedTaskTypes.map(taskType => {
    const avgDuration = patterns.averageDuration[taskType] || { estimated: 1, actual: 0.5 };
    
    // Select platform based on task type or default to most frequent
    let suggestedPlatform = sortedPlatforms[0];
    
    // Select tools based on task type efficiency
    const suggestedTools = sortedTools.slice(0, 2);
    
    return {
      taskCategory: taskType,
      estimatedTimeWithoutAI: avgDuration.estimated.toFixed(2),
      actualTimeWithAI: avgDuration.actual.toFixed(2),
      platform: suggestedPlatform,
      aiToolsUsed: suggestedTools,
      timeSavingPotential: avgDuration.averageSavings,
      confidence: calculateConfidence(patterns, taskType),
      isPrediction: true
    };
  });
  
  return predictions;
};

/**
 * Suggests optimal scheduling based on productivity patterns
 * 
 * @param {Object} patterns - Patterns derived from historical data
 * @param {Array} pendingTasks - Tasks that need to be scheduled
 * @returns {Object} Scheduling suggestions
 */
export const suggestScheduling = (patterns, pendingTasks = []) => {
  if (!patterns || !pendingTasks || pendingTasks.length === 0) {
    return {
      scheduleSuggestions: [],
      optimalTimeOfDay: 'morning'
    };
  }
  
  // Determine optimal time of day
  let optimalTimeOfDay = 'morning';
  let maxTimeCount = 0;
  
  Object.entries(patterns.timeOfDay || {}).forEach(([timeSlot, count]) => {
    if (count > maxTimeCount) {
      optimalTimeOfDay = timeSlot;
      maxTimeCount = count;
    }
  });
  
  // Sort tasks by complexity and time-saving potential
  const scheduleSuggestions = [...pendingTasks]
    .sort((a, b) => {
      // First prioritize by complexity (high to low)
      const complexityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      const complexityDiff = (complexityOrder[b.complexity] || 0) - (complexityOrder[a.complexity] || 0);
      
      if (complexityDiff !== 0) {
        return complexityDiff;
      }
      
      // Then by time-saving potential (high to low)
      const aTimeSaving = parseFloat(a.estimatedTimeWithoutAI || 0) - parseFloat(a.actualTimeWithAI || 0);
      const bTimeSaving = parseFloat(b.estimatedTimeWithoutAI || 0) - parseFloat(b.actualTimeWithAI || 0);
      
      return bTimeSaving - aTimeSaving;
    })
    .map((task, index) => ({
      ...task,
      suggestedOrder: index + 1,
      timeSlot: index < pendingTasks.length / 3 ? optimalTimeOfDay :
                index < pendingTasks.length * 2 / 3 ? getNextTimeSlot(optimalTimeOfDay) :
                getFinalTimeSlot(optimalTimeOfDay)
    }));
  
  return {
    scheduleSuggestions,
    optimalTimeOfDay
  };
};

/**
 * Calculates confidence score for a prediction
 * 
 * @param {Object} patterns - Patterns derived from historical data
 * @param {string} taskType - The task type being scored
 * @returns {number} Confidence score (0-100)
 */
const calculateConfidence = (patterns, taskType) => {
  if (!patterns || !taskType) {
    return 50;
  }
  
  const totalTasks = Object.values(patterns.taskTypeFrequency).reduce((sum, count) => sum + count, 0);
  const taskTypeCount = patterns.taskTypeFrequency[taskType] || 0;
  
  // Base confidence on frequency of task type
  let confidence = (taskTypeCount / totalTasks) * 100;
  
  // Adjust confidence based on data volume
  const dataVolumeFactor = Math.min(totalTasks / 10, 1);
  confidence = confidence * dataVolumeFactor + 50 * (1 - dataVolumeFactor);
  
  // Ensure confidence is between 20 and 95
  return Math.min(Math.max(confidence, 20), 95);
};

/**
 * Gets the next time slot in the sequence
 * 
 * @param {string} currentTimeSlot - Current time slot
 * @returns {string} Next time slot
 */
const getNextTimeSlot = (currentTimeSlot) => {
  const slots = {
    'morning': 'afternoon',
    'afternoon': 'evening',
    'evening': 'morning'
  };
  
  return slots[currentTimeSlot] || 'afternoon';
};

/**
 * Gets the final time slot in the sequence
 * 
 * @param {string} startTimeSlot - Starting time slot
 * @returns {string} Final time slot
 */
const getFinalTimeSlot = (startTimeSlot) => {
  const slots = {
    'morning': 'evening',
    'afternoon': 'morning',
    'evening': 'afternoon'
  };
  
  return slots[startTimeSlot] || 'evening';
};

/**
 * Gets historical tasks from the report data
 * 
 * @param {Array} reports - Array of report objects
 * @returns {Array} Historical tasks extracted from reports
 */
export const getHistoricalTasksFromReports = (reports = []) => {
  if (!reports || reports.length === 0) {
    return [];
  }
  
  const allTasks = [];
  
  reports.forEach(report => {
    if (report.data && report.data.rows && Array.isArray(report.data.rows)) {
      // Add timestamp from the report to each task
      const tasksWithTimestamp = report.data.rows.map(task => ({
        ...task,
        timestamp: report.timestamp || new Date().toISOString(),
        reportId: report.id || null
      }));
      
      allTasks.push(...tasksWithTimestamp);
    }
  });
  
  return allTasks;
};

/**
 * Filters and sorts tasks that are appropriate for current context
 * 
 * @param {Array} predictions - All predicted tasks
 * @param {Object} currentContext - Current work context
 * @returns {Array} Filtered and prioritized tasks
 */
export const filterRelevantPredictions = (predictions, currentContext = {}) => {
  if (!predictions || predictions.length === 0) {
    return [];
  }
  
  const { platform, complexity, aiTools } = currentContext;
  
  // Filter predictions based on context
  let filteredPredictions = [...predictions];
  
  if (platform) {
    filteredPredictions = filteredPredictions.filter(pred => 
      !pred.platform || pred.platform === platform);
  }
  
  if (complexity) {
    filteredPredictions = filteredPredictions.filter(pred => 
      !pred.complexity || pred.complexity === complexity);
  }
  
  if (aiTools && aiTools.length) {
    filteredPredictions = filteredPredictions.filter(pred => 
      !pred.aiToolsUsed || pred.aiToolsUsed.some(tool => aiTools.includes(tool)));
  }
  
  // Sort by confidence
  return filteredPredictions.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
};