/**
 * ProblemProvider.js
 *
 * This component defines the global state for the Redux application.
 *
 * It uses a global "context" which any individual component can then tap into by using the useContext react hook.
 * Essentially, all the methods in here are setters, and so components can either use the context hook to access a read only
 * global state value, or use a provided setter method to edit the state of that global state value.
 *
 * @author Alex Diviney
 */

import React, { createContext } from "react";
import { useProblemProvider } from '../hooks/ProblemProvider';

export const ProblemContext = createContext();

export default function ProblemProvider({ url, children }) {
  return <ProblemContext.Provider value={useProblemProvider(url)}>{children}</ProblemContext.Provider>;
}
