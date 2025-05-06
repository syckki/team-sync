import React, { useState, useEffect } from 'react';
import { 
  analyzeTaskPatterns, 
  predictTasks, 
  getHistoricalTasksFromReports,
  filterRelevantPredictions
} from '../../lib/taskPrediction';
import { createOptimizedSchedule, adjustScheduleWithFeedback } from '../../lib/taskScheduling';
import TaskPredictionPanel from '../presentational/TaskPredictionPanel';

/**
 * Container component that manages task prediction logic and data
 */
const TaskPredictionContainer = ({ 
  historicalReports = [], 
  currentTasks = [],
  userPreferences = {},
  onAddTask,
  onUpdateTasks
}) => {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [taskPatterns, setTaskPatterns] = useState(null);
  const [taskPredictions, setTaskPredictions] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [currentContext, setCurrentContext] = useState({});
  
  // Generate patterns and predictions when historical data changes
  useEffect(() => {
    const generatePredictions = async () => {
      if (!historicalReports || historicalReports.length === 0) {
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Extract tasks from reports
        const historicalTasks = getHistoricalTasksFromReports(historicalReports);
        
        // Analyze patterns
        const patterns = analyzeTaskPatterns(historicalTasks);
        setTaskPatterns(patterns);
        
        // Generate predictions
        const predictions = predictTasks(patterns, currentContext);
        
        // Filter relevant predictions
        const filteredPredictions = filterRelevantPredictions(predictions, currentContext);
        setTaskPredictions(filteredPredictions.slice(0, 5)); // Show top 5 predictions
        
        // Create a schedule with current tasks and predictions
        if (currentTasks.length > 0 || filteredPredictions.length > 0) {
          const tasksToSchedule = [
            ...currentTasks,
            // Add top 3 predictions that aren't already in current tasks
            ...filteredPredictions
              .slice(0, 3)
              .filter(pred => !currentTasks.some(task => 
                task.taskCategory === pred.taskCategory && 
                task.platform === pred.platform
              ))
          ];
          
          const optimizedSchedule = createOptimizedSchedule(tasksToSchedule, userPreferences);
          setSchedule(optimizedSchedule);
        }
      } catch (error) {
        console.error('Error generating predictions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    generatePredictions();
  }, [historicalReports, currentContext]);
  
  // Update context based on current user activity
  useEffect(() => {
    // This could be expanded to include more context like time of day, current platform, etc.
    if (currentTasks.length > 0) {
      const lastTask = currentTasks[currentTasks.length - 1];
      
      setCurrentContext({
        platform: lastTask.platform,
        complexity: lastTask.complexity,
        aiTools: lastTask.aiToolsUsed
      });
    }
  }, [currentTasks]);
  
  // Handlers
  const handleAddTask = (task) => {
    // Convert prediction to a task entry
    const newTask = {
      ...task,
      id: `task-${Date.now()}`,
      isPrediction: false, // No longer a prediction once added
    };
    
    // Call parent handler
    if (onAddTask) {
      onAddTask(newTask);
    }
    
    // Remove from predictions
    setTaskPredictions(prevPredictions => 
      prevPredictions.filter(pred => 
        !(pred.taskCategory === task.taskCategory && 
          pred.platform === task.platform)
      )
    );
    
    // Update schedule with new task
    const updatedTasks = [...currentTasks, newTask];
    const optimizedSchedule = createOptimizedSchedule(updatedTasks, userPreferences);
    setSchedule(optimizedSchedule);
  };
  
  const handleIgnoreTask = (task) => {
    // Remove prediction from list
    setTaskPredictions(prevPredictions => 
      prevPredictions.filter(pred => 
        !(pred.taskCategory === task.taskCategory && 
          pred.platform === task.platform)
      )
    );
  };
  
  const handleUseSchedule = (schedule) => {
    // Schedule is being applied - update tasks to match scheduled order
    if (onUpdateTasks && schedule && schedule.timeBlocks) {
      const orderedTasks = schedule.timeBlocks
        .filter(block => block.type === 'task')
        .map(block => ({
          ...block.task,
          scheduledStartTime: block.startTime,
          scheduledEndTime: block.endTime
        }));
      
      onUpdateTasks(orderedTasks);
    }
  };
  
  const handleAdjustSchedule = (schedule, adjustments) => {
    if (!adjustments) {
      // If no specific adjustments, we're just showing adjustment UI
      // This would typically be handled by a modal or expanded view
      console.log('Show schedule adjustment UI');
      return;
    }
    
    // Apply adjustments to schedule
    const adjustedSchedule = adjustScheduleWithFeedback(schedule, adjustments);
    setSchedule(adjustedSchedule);
  };
  
  // If we have very little data, don't show the prediction panel yet
  const hasEnoughData = 
    historicalReports && historicalReports.length >= 1 && 
    taskPatterns && Object.keys(taskPatterns.taskTypeFrequency).length > 0;
  
  if (!hasEnoughData && !isLoading) {
    return null;
  }
  
  return (
    <TaskPredictionPanel
      predictions={taskPredictions}
      schedule={schedule}
      isLoading={isLoading}
      onAddTask={handleAddTask}
      onIgnoreTask={handleIgnoreTask}
      onUseSchedule={handleUseSchedule}
      onAdjustSchedule={handleAdjustSchedule}
    />
  );
};

export default TaskPredictionContainer;