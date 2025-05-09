/**
 * A lightweight implementation of a state machine inspired by XState concepts
 * This allows us to implement state machine patterns without external libraries
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Creates a simple state machine
 * @param {Object} config - Machine configuration
 * @param {string} config.id - Machine ID
 * @param {Object} config.context - Initial context data
 * @param {string} config.initial - Initial state
 * @param {Object} config.states - State definitions
 * @returns {Object} State machine definition
 */
export const createMachine = (config) => {
  return {
    ...config,
    __type: 'machine',
  };
};

/**
 * Custom hook to use a state machine in React components
 * @param {Object} machine - State machine created with createMachine
 * @param {Object} options - Machine options
 * @param {Object} options.actions - Action implementations
 * @param {Object} options.services - Service implementations
 * @param {Object} options.guards - Guard implementations
 * @returns {Array} [state, send] - Current state and function to send events
 */
export const useMachine = (machine, options = {}) => {
  const { actions = {}, services = {}, guards = {} } = options;
  
  // Initialize state
  const [state, setState] = useState({
    value: machine.initial,
    context: { ...machine.context },
    actions: [],
  });
  
  // Track if component is mounted
  const [mounted, setMounted] = useState(true);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Send events to the state machine
  const send = useCallback((event) => {
    if (!mounted) return;
    
    const { value: currentState, context: currentContext } = state;
    const stateConfig = machine.states[currentState];
    
    // Find transition for this event
    const transition = typeof event === 'string' 
      ? stateConfig?.on?.[event]
      : stateConfig?.on?.[event.type];
    
    if (!transition) return;
    
    // Handle simple transition
    if (typeof transition === 'string') {
      setState({
        value: transition,
        context: currentContext,
        actions: []
      });
      return;
    }
    
    // Handle complex transition
    if (transition.target) {
      // Check guard condition if present
      if (transition.cond && !guards[transition.cond](currentContext, event)) {
        return;
      }
      
      // Execute actions if any
      let updatedContext = { ...currentContext };
      const pendingActions = [];
      
      if (transition.actions) {
        const actionNames = Array.isArray(transition.actions) 
          ? transition.actions 
          : [transition.actions];
          
        actionNames.forEach(actionName => {
          if (actions[actionName]) {
            const result = actions[actionName](updatedContext, event);
            if (result) {
              updatedContext = { ...updatedContext, ...result };
            }
            pendingActions.push(actionName);
          }
        });
      }
      
      // Update state
      setState({
        value: transition.target,
        context: updatedContext,
        actions: pendingActions,
      });
      
      // Handle service invocation
      const targetState = machine.states[transition.target];
      if (targetState?.invoke?.src && services[targetState.invoke.src]) {
        const service = services[targetState.invoke.src];
        
        Promise.resolve(service(updatedContext, event))
          .then(result => {
            if (!mounted) return;
            
            // Handle service completion
            const onDoneTransition = targetState.invoke.onDone;
            if (onDoneTransition) {
              let nextContext = { ...updatedContext };
              
              // Execute onDone actions
              if (onDoneTransition.actions) {
                const actionNames = Array.isArray(onDoneTransition.actions)
                  ? onDoneTransition.actions
                  : [onDoneTransition.actions];
                  
                actionNames.forEach(actionName => {
                  if (actions[actionName]) {
                    const actionResult = actions[actionName](nextContext, { data: result });
                    if (actionResult) {
                      nextContext = { ...nextContext, ...actionResult };
                    }
                  }
                });
              }
              
              setState({
                value: onDoneTransition.target,
                context: nextContext,
                actions: [],
              });
            }
          })
          .catch(error => {
            if (!mounted) return;
            
            // Handle service error
            const onErrorTransition = targetState.invoke.onError;
            if (onErrorTransition) {
              let nextContext = { ...updatedContext, error };
              
              // Execute onError actions
              if (onErrorTransition.actions) {
                const actionNames = Array.isArray(onErrorTransition.actions)
                  ? onErrorTransition.actions
                  : [onErrorTransition.actions];
                  
                actionNames.forEach(actionName => {
                  if (actions[actionName]) {
                    const actionResult = actions[actionName](nextContext, { data: error });
                    if (actionResult) {
                      nextContext = { ...nextContext, ...actionResult };
                    }
                  }
                });
              }
              
              setState({
                value: onErrorTransition.target,
                context: nextContext,
                actions: [],
              });
            }
          });
      }
    }
  }, [state, machine, actions, services, guards, mounted]);

  return [state, send];
};