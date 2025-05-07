#!/usr/bin/env node

/**
 * Yarn wrapper for Next.js in Replit
 * 
 * This script allows using Yarn commands while still maintaining 
 * compatibility with Replit's workflows.
 */

const { spawn } = require('child_process');
const path = require('path');

// Get the command to run
const args = process.argv.slice(2);
const command = args[0];

// Map of commands that should be handled specially
const commandMap = {
  'dev': ['next', ['dev', '-p', '5000']],
  'build': ['next', ['build']],
  'start': ['next', ['start']],
};

// Default to passing through to npm if no special handling
let executable = 'npm';
let execArgs = process.argv.slice(2);

// Use special handling for known commands
if (commandMap[command]) {
  const [cmd, cmdArgs] = commandMap[command];
  executable = cmd;
  execArgs = cmdArgs;
  console.log(`🧶 Yarn wrapper: Running ${executable} ${execArgs.join(' ')}`);
} else {
  console.log(`🧶 Yarn wrapper: Passing through to npm: ${execArgs.join(' ')}`);
}

// Run the command
const proc = spawn(executable, execArgs, {
  stdio: 'inherit',
  env: process.env,
});

// Handle process exit
proc.on('close', (code) => {
  process.exit(code);
});