/**
 * Lightweight state machine implementation inspired by XState
 * This provides similar functionality without requiring external dependencies
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Creates a minimal state machine
 * @param {Object} config - State machine configuration
 * @param {string} config.id - Machine identifier
 * @param {Object} config.context - Initial context
 * @param {string} config.initial - Initial state
 * @param {Object} config.states - State definitions
 * @param {Object} services - Service implementations
 * @param {Object} actions - Action implementations
 * @param {Object} guards - Guard (condition) implementations
 * @returns {Object} State machine instance
 */
export const createMachine = (config, { services = {}, actions = {}, guards = {} } = {}) => {
  return {
    id: config.id,
    initialContext: config.context || {},
    initialState: config.initial,
    states: config.states,
    services,
    actions,
    guards,
    transition: (state, event, context) => {
      const currentStateConfig = config.states[state];
      if (!currentStateConfig || !currentStateConfig.on) {
        return { state, context };
      }

      const transition = currentStateConfig.on[event.type];
      if (!transition) {
        return { state, context };
      }

      // Handle target and actions
      let nextState = state;
      let nextContext = { ...context };

      // If transition is an object with target
      if (typeof transition === 'object') {
        // Check condition if provided
        if (transition.cond && guards[transition.cond]) {
          if (!guards[transition.cond](context, event)) {
            return { state, context };
          }
        }

        // Set next state if target is provided
        if (transition.target) {
          nextState = transition.target;
        }

        // Execute actions if provided
        if (transition.actions) {
          const actionsList = Array.isArray(transition.actions)
            ? transition.actions
            : [transition.actions];

          for (const actionName of actionsList) {
            if (actions[actionName]) {
              const result = actions[actionName](nextContext, event);
              if (result) {
                nextContext = { ...nextContext, ...result };
              }
            }
          }
        }
      } else if (typeof transition === 'string') {
        // If transition is just a string, treat it as a target
        nextState = transition;
      }

      // Execute entry actions for the next state
      const nextStateConfig = config.states[nextState];
      if (nextStateConfig && nextStateConfig.entry) {
        const entryActions = Array.isArray(nextStateConfig.entry)
          ? nextStateConfig.entry
          : [nextStateConfig.entry];

        for (const actionName of entryActions) {
          if (actions[actionName]) {
            const result = actions[actionName](nextContext, event);
            if (result) {
              nextContext = { ...nextContext, ...result };
            }
          }
        }
      }

      return { state: nextState, context: nextContext };
    }
  };
};

/**
 * React hook for using a state machine
 * @param {Object} machine - State machine instance
 * @param {Object} options - Hook options
 * @returns {Array} [state, send, context]
 */
export const useMachine = (machine, options = {}) => {
  const [current, setCurrent] = useState({
    state: machine.initialState,
    context: { ...machine.initialContext }
  });

  const serviceRef = useRef({});
  
  // Send events to the state machine
  const send = useCallback((event) => {
    if (typeof event === 'string') {
      event = { type: event };
    }

    setCurrent(current => {
      const next = machine.transition(current.state, event, current.context);
      return next;
    });
  }, [machine]);

  // Handle services (invocations)
  useEffect(() => {
    const currentStateConfig = machine.states[current.state];
    
    // Clear previous services
    Object.values(serviceRef.current).forEach(cleanup => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    });
    serviceRef.current = {};

    // Start services for this state
    if (currentStateConfig && currentStateConfig.invoke) {
      const invocations = Array.isArray(currentStateConfig.invoke)
        ? currentStateConfig.invoke
        : [currentStateConfig.invoke];

      invocations.forEach(invoke => {
        const serviceId = typeof invoke === 'string' ? invoke : invoke.src;
        const service = machine.services[serviceId];

        if (service) {
          // Call service with context, event object, and callbacks
          const cleanup = service(
            current.context,
            { type: 'INVOKE' },
            {
              onDone: (data) => send({ type: 'done.invoke', data }),
              onError: (error) => send({ type: 'error.invoke', error })
            }
          );

          if (typeof cleanup === 'function') {
            serviceRef.current[serviceId] = cleanup;
          }
        }
      });
    }

    // Check for after transitions (delayed transitions)
    if (currentStateConfig && currentStateConfig.after) {
      Object.entries(currentStateConfig.after).forEach(([delay, transition]) => {
        const timeoutId = setTimeout(() => {
          if (typeof transition === 'string') {
            send({ type: transition });
          } else {
            send({ type: 'after.timeout' });
          }
        }, parseInt(delay, 10));

        serviceRef.current[`after-${delay}`] = () => clearTimeout(timeoutId);
      });
    }

    return () => {
      Object.values(serviceRef.current).forEach(cleanup => {
        if (typeof cleanup === 'function') {
          cleanup();
        }
      });
    };
  }, [current.state, machine, send]);

  return [
    current.state, 
    send, 
    current.context,
    { state: current.state, context: current.context }
  ];
};