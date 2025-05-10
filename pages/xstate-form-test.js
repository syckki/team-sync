import React, { useState } from 'react';
import ReportFormViewModel from '../viewModels/ReportFormViewModel';
import ReportFormViewModelXState from '../viewModels/ReportFormViewModelXState';

export default function XStateFormTest() {
  const [implementation, setImplementation] = useState('original');
  
  // Generate a random key fragment for testing
  const keyFragment = "dGVzdF9rZXlfZnJhZ21lbnQ="; // Base64 for "test_key_fragment"
  const teamName = "Test Team";
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Report Form Implementation Comparison</h1>
      
      <div className="mb-6 flex items-center gap-4">
        <div className="font-bold">Choose Implementation:</div>
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="implementation"
            value="original"
            checked={implementation === 'original'}
            onChange={() => setImplementation('original')}
            className="mr-2"
          />
          Original
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="implementation"
            value="xstate"
            checked={implementation === 'xstate'}
            onChange={() => setImplementation('xstate')}
            className="mr-2"
          />
          XState
        </label>
      </div>
      
      <div className="border rounded p-4">
        {implementation === 'original' ? (
          <div>
            <h2 className="text-xl font-bold mb-4">Original Implementation</h2>
            <ReportFormViewModel
              keyFragment={keyFragment}
              teamName={teamName}
            />
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold mb-4">XState Implementation</h2>
            <ReportFormViewModelXState
              keyFragment={keyFragment}
              teamName={teamName}
            />
          </div>
        )}
      </div>
    </div>
  );
}