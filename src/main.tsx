import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// Import wake-up service to prevent backend from sleeping
import './services/wakeUpService'

// Import performance optimizations
import { initializePerformanceOptimizations } from './utils/performance'

// Initialize performance optimizations
initializePerformanceOptimizations();

// Prevent unwanted scrolling on interactive elements
const preventUnwantedScroll = () => {
  // Store original scrollIntoView method
  const originalScrollIntoView = Element.prototype.scrollIntoView;
  
  // Override scrollIntoView to prevent unwanted scrolling
  Element.prototype.scrollIntoView = function(options?: boolean | ScrollIntoViewOptions) {
    // Check if this element is a dropdown, popover, or select content
    const isDropdownContent = this.closest('[data-radix-popper-content-wrapper]') ||
                             this.closest('[data-radix-popover-content]') ||
                             this.closest('[data-radix-dropdown-menu-content]') ||
                             this.closest('[data-radix-select-content]') ||
                             this.closest('[role="menu"]') ||
                             this.closest('[role="listbox"]');
    
    // Check if this element is a button that shouldn't cause scrolling
    const isNonSubmitButton = this.tagName === 'BUTTON' && this.getAttribute('type') !== 'submit';
    
    // Check if this element is a dropdown trigger
    const isDropdownTrigger = this.closest('[data-radix-trigger]') ||
                             this.closest('[role="button"]') ||
                             this.closest('[aria-haspopup="true"]');
    
    // If it's any of these elements, don't scroll
    if (isDropdownContent || isNonSubmitButton || isDropdownTrigger) {
      return; // Don't scroll
    }
    
    // Otherwise, use the original method
    return originalScrollIntoView.call(this, options);
  };

  // Prevent form submission on non-submit buttons
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    
    // If clicking a button that's not explicitly a submit button
    if (target.tagName === 'BUTTON' && target.getAttribute('type') !== 'submit') {
      // Prevent form submission if this button is inside a form
      const form = target.closest('form');
      if (form) {
        e.preventDefault();
      }
    }
  });
};

// Initialize scroll prevention
preventUnwantedScroll();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
