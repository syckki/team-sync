/**
 * Task scheduling utilities
 * This module contains functions for intelligent task scheduling
 * based on predicted tasks and user preferences.
 */

/**
 * Creates an optimized schedule for tasks
 * 
 * @param {Array} tasks - Tasks to schedule
 * @param {Object} userPreferences - User scheduling preferences
 * @returns {Object} Optimized schedule with time blocks
 */
export const createOptimizedSchedule = (tasks, userPreferences = {}) => {
  if (!tasks || tasks.length === 0) {
    return {
      timeBlocks: [],
      totalDuration: 0,
      completionTime: null
    };
  }
  
  const {
    startTime = new Date(),
    availableHours = 8,
    breakDuration = 15, // minutes
    breakFrequency = 2, // hours
    prioritizeByCost = false, // prioritize cost-saving tasks
    preferConsistentTools = true // prefer consistent tools in consecutive tasks
  } = userPreferences;
  
  // Clone tasks to avoid modifying the original
  let schedulableTasks = tasks.map(task => ({
    ...task,
    scheduleDuration: parseFloat(task.actualTimeWithAI) || 0.5,
    priority: calculateTaskPriority(task, prioritizeByCost)
  }));
  
  // Sort tasks by priority (descending)
  schedulableTasks.sort((a, b) => b.priority - a.priority);
  
  // Group similar tasks together if preferConsistentTools is true
  if (preferConsistentTools) {
    schedulableTasks = groupSimilarTasks(schedulableTasks);
  }
  
  // Initialize schedule
  const timeBlocks = [];
  let currentTime = new Date(startTime);
  let totalDuration = 0;
  let hoursUntilBreak = breakFrequency;
  
  // Create time blocks for each task
  schedulableTasks.forEach(task => {
    const taskDurationHours = task.scheduleDuration;
    
    // Check if we need a break before this task
    if (hoursUntilBreak <= taskDurationHours && totalDuration > 0) {
      // Add a break
      const breakStartTime = new Date(currentTime);
      const breakEndTime = new Date(breakStartTime);
      breakEndTime.setMinutes(breakEndTime.getMinutes() + breakDuration);
      
      timeBlocks.push({
        type: 'break',
        startTime: formatTime(breakStartTime),
        endTime: formatTime(breakEndTime),
        duration: breakDuration / 60, // convert to hours
      });
      
      currentTime = new Date(breakEndTime);
      hoursUntilBreak = breakFrequency;
    }
    
    // Add task to schedule
    const taskStartTime = new Date(currentTime);
    const taskEndTime = new Date(taskStartTime);
    taskEndTime.setMinutes(taskEndTime.getMinutes() + taskDurationHours * 60);
    
    timeBlocks.push({
      type: 'task',
      task: task,
      startTime: formatTime(taskStartTime),
      endTime: formatTime(taskEndTime),
      duration: taskDurationHours,
    });
    
    currentTime = new Date(taskEndTime);
    totalDuration += taskDurationHours;
    hoursUntilBreak -= taskDurationHours;
  });
  
  return {
    timeBlocks,
    totalDuration,
    completionTime: formatTime(currentTime),
    isWithinAvailableHours: totalDuration <= availableHours
  };
};

/**
 * Groups similar tasks together based on tools and category
 * 
 * @param {Array} tasks - Tasks to group
 * @returns {Array} Grouped tasks
 */
const groupSimilarTasks = (tasks) => {
  const result = [];
  const remainingTasks = [...tasks];
  
  while (remainingTasks.length > 0) {
    const currentTask = remainingTasks.shift();
    result.push(currentTask);
    
    // Find similar tasks (same tools or same category)
    const similarTaskIndices = [];
    
    for (let i = 0; i < remainingTasks.length; i++) {
      const task = remainingTasks[i];
      
      // Check if using same AI tools
      const hasSameTools = currentTask.aiToolsUsed && task.aiToolsUsed && 
        currentTask.aiToolsUsed.some(tool => task.aiToolsUsed.includes(tool));
      
      // Check if same task category
      const hasSameCategory = currentTask.taskCategory === task.taskCategory;
      
      // Check if same platform
      const hasSamePlatform = currentTask.platform === task.platform;
      
      if (hasSameTools || (hasSameCategory && hasSamePlatform)) {
        similarTaskIndices.push(i);
      }
    }
    
    // Add similar tasks to the result and remove from remaining tasks
    similarTaskIndices.reverse().forEach(index => {
      result.push(remainingTasks[index]);
      remainingTasks.splice(index, 1);
    });
  }
  
  return result;
};

/**
 * Calculates a priority score for a task based on various factors
 * 
 * @param {Object} task - Task to calculate priority for
 * @param {boolean} prioritizeByCost - Whether to prioritize cost-saving tasks
 * @returns {number} Priority score
 */
const calculateTaskPriority = (task, prioritizeByCost) => {
  let priority = 0;
  
  // Base priority on complexity
  const complexityScore = { 'High': 30, 'Medium': 20, 'Low': 10 };
  priority += complexityScore[task.complexity] || 15;
  
  // Priority based on time saving potential
  const estimatedTime = parseFloat(task.estimatedTimeWithoutAI) || 0;
  const actualTime = parseFloat(task.actualTimeWithAI) || 0;
  const timeSaving = estimatedTime - actualTime;
  
  if (prioritizeByCost && timeSaving > 0) {
    priority += timeSaving * 10;
  }
  
  // Additional points for high-confidence predictions
  if (task.confidence) {
    priority += task.confidence / 10;
  }
  
  return priority;
};

/**
 * Formats a date object to a time string (HH:MM)
 * 
 * @param {Date} date - Date object to format
 * @returns {string} Formatted time string
 */
const formatTime = (date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Adjusts a schedule based on user feedback
 * 
 * @param {Object} schedule - Current schedule
 * @param {Object} feedback - User feedback to incorporate
 * @returns {Object} Adjusted schedule
 */
export const adjustScheduleWithFeedback = (schedule, feedback) => {
  if (!schedule || !feedback) {
    return schedule;
  }
  
  const { timeBlocks } = schedule;
  const {
    taskToAdjust,
    newDuration,
    moveEarlier,
    moveLater,
    removeTask,
    addBreak
  } = feedback;
  
  // Create a new schedule based on the feedback
  let adjustedTimeBlocks = [...timeBlocks];
  
  // Handle task removal
  if (removeTask && removeTask.id) {
    adjustedTimeBlocks = adjustedTimeBlocks.filter(block => 
      block.type !== 'task' || block.task.id !== removeTask.id);
  }
  
  // Handle duration adjustment
  if (taskToAdjust && newDuration) {
    const blockIndex = adjustedTimeBlocks.findIndex(block => 
      block.type === 'task' && block.task.id === taskToAdjust.id);
    
    if (blockIndex >= 0) {
      const oldDuration = adjustedTimeBlocks[blockIndex].duration;
      const durationDiff = newDuration - oldDuration;
      
      // Update the block duration
      adjustedTimeBlocks[blockIndex] = {
        ...adjustedTimeBlocks[blockIndex],
        duration: newDuration,
      };
      
      // Adjust end time
      const startTime = parseTimeString(adjustedTimeBlocks[blockIndex].startTime);
      const newEndTime = new Date(startTime);
      newEndTime.setMinutes(newEndTime.getMinutes() + newDuration * 60);
      adjustedTimeBlocks[blockIndex].endTime = formatTime(newEndTime);
      
      // Shift subsequent blocks
      for (let i = blockIndex + 1; i < adjustedTimeBlocks.length; i++) {
        const block = adjustedTimeBlocks[i];
        const blockStartTime = parseTimeString(block.startTime);
        const blockEndTime = parseTimeString(block.endTime);
        
        blockStartTime.setMinutes(blockStartTime.getMinutes() + durationDiff * 60);
        blockEndTime.setMinutes(blockEndTime.getMinutes() + durationDiff * 60);
        
        adjustedTimeBlocks[i] = {
          ...block,
          startTime: formatTime(blockStartTime),
          endTime: formatTime(blockEndTime)
        };
      }
    }
  }
  
  // Handle task movement (earlier/later)
  if (taskToAdjust && (moveEarlier || moveLater)) {
    // Implementation for task reordering would go here
    // This would involve swapping task positions and recalculating times
  }
  
  // Handle adding a break
  if (addBreak) {
    const { afterTaskId, duration = 15 } = addBreak;
    
    const taskIndex = adjustedTimeBlocks.findIndex(block => 
      block.type === 'task' && block.task.id === afterTaskId);
    
    if (taskIndex >= 0 && taskIndex < adjustedTimeBlocks.length - 1) {
      const afterBlock = adjustedTimeBlocks[taskIndex];
      const breakStartTime = parseTimeString(afterBlock.endTime);
      const breakEndTime = new Date(breakStartTime);
      breakEndTime.setMinutes(breakEndTime.getMinutes() + duration);
      
      const newBreak = {
        type: 'break',
        startTime: formatTime(breakStartTime),
        endTime: formatTime(breakEndTime),
        duration: duration / 60
      };
      
      // Insert break after the specified task
      adjustedTimeBlocks.splice(taskIndex + 1, 0, newBreak);
      
      // Shift subsequent blocks
      for (let i = taskIndex + 2; i < adjustedTimeBlocks.length; i++) {
        const block = adjustedTimeBlocks[i];
        const blockStartTime = parseTimeString(block.startTime);
        const blockEndTime = parseTimeString(block.endTime);
        
        blockStartTime.setMinutes(blockStartTime.getMinutes() + duration);
        blockEndTime.setMinutes(blockEndTime.getMinutes() + duration);
        
        adjustedTimeBlocks[i] = {
          ...block,
          startTime: formatTime(blockStartTime),
          endTime: formatTime(blockEndTime)
        };
      }
    }
  }
  
  // Recalculate total duration and completion time
  const totalDuration = adjustedTimeBlocks.reduce((sum, block) => sum + block.duration, 0);
  const lastBlock = adjustedTimeBlocks[adjustedTimeBlocks.length - 1];
  const completionTime = lastBlock ? lastBlock.endTime : schedule.completionTime;
  
  return {
    timeBlocks: adjustedTimeBlocks,
    totalDuration,
    completionTime,
    isWithinAvailableHours: totalDuration <= schedule.availableHours
  };
};

/**
 * Parses a time string into a Date object
 * 
 * @param {string} timeString - Time string in HH:MM format
 * @returns {Date} Date object
 */
const parseTimeString = (timeString) => {
  const date = new Date();
  const [hours, minutes] = timeString.split(':').map(part => parseInt(part, 10));
  
  if (!isNaN(hours) && !isNaN(minutes)) {
    date.setHours(hours, minutes, 0, 0);
  }
  
  return date;
};