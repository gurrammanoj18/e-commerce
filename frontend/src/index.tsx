import React from 'react';
import ReactDOM from 'react-dom/client';
import "./styles/base.css";
import App from './App';
import reportWebVitals from './reportWebVitals';

const preventZoomShortcuts = (event: WheelEvent | KeyboardEvent | TouchEvent | Event) => {
  if (event instanceof WheelEvent && event.ctrlKey) {
    event.preventDefault();
    return;
  }

  if (event instanceof KeyboardEvent && (event.ctrlKey || event.metaKey)) {
    const blockedKeys = ["+", "-", "=", "_", "Add", "Subtract", "0"];
    if (blockedKeys.includes(event.key)) {
      event.preventDefault();
      return;
    }
  }

  if (event instanceof TouchEvent && event.touches.length > 1) {
    event.preventDefault();
  }
};

document.addEventListener("wheel", preventZoomShortcuts, { passive: false });
document.addEventListener("keydown", preventZoomShortcuts, { passive: false });
document.addEventListener("touchmove", preventZoomShortcuts, { passive: false });
document.addEventListener("gesturestart", preventZoomShortcuts as EventListener, { passive: false });
document.addEventListener("gesturechange", preventZoomShortcuts as EventListener, { passive: false });

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
