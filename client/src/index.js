import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js';

const ignorePatterns = [
  /validateDOMNesting/i,
  /Invalid DOM property/i,
  /className/i,
  /preload/i,
  /prefetch/i,
  /value-not-animatable/i,
  /was preloaded/i,
];

const originalWarn = console.warn;
const originalError = console.error;

function shouldIgnore(args) {
  const message = args.map(String).join(" ");
  return ignorePatterns.some(p => p.test(message));
}

console.warn = (...args) => {
  if (shouldIgnore(args)) return;
  originalWarn(...args);
};

console.error = (...args) => {
  if (shouldIgnore(args)) return;
  originalError(...args);
};

// silence everything in prod
if (process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  (process.env.NODE_ENV !== "production") ? (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  ) : (
    <App />
  )
);
