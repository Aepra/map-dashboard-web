'use client';

import { useEffect } from 'react';

export default function DevToolsHider() {
  useEffect(() => {
    // Add extremely aggressive CSS with all possible hiding techniques
    const cssStyle = document.createElement('style');
    cssStyle.id = 'dev-tools-killer-css';
    cssStyle.textContent = `
      button[aria-label="Open Next.js Dev Tools"],
      button[aria-label*="Dev Tools"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        width: 0 !important;
        height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        pointer-events: none !important;
        position: absolute !important;
        left: -9999px !important;
        top: -9999px !important;
      }
    `;
    document.head.appendChild(cssStyle);

    // Remove from shadow DOM and regular DOM
    const removeDevTools = () => {
      try {
        // Regular DOM removal
        const btn = document.querySelector('button[aria-label="Open Next.js Dev Tools"]');
        if (btn) {
          btn.remove();
        }

        // Remove from all shadow DOM roots
        const elementsWithShadow = Array.from(document.querySelectorAll('*')).filter(
          (el) => el.shadowRoot,
        );

        elementsWithShadow.forEach((el) => {
          if (el.shadowRoot) {
            const shadowBtn = el.shadowRoot.querySelector('button[aria-label*="Dev Tools"]');
            if (shadowBtn) {
              shadowBtn.remove();
            }

            // Also try hiding with CSS inside shadow DOM
            if (!el.shadowRoot.querySelector('#dev-tools-hidden-style')) {
              const shadowStyle = document.createElement('style');
              shadowStyle.id = 'dev-tools-hidden-style';
              shadowStyle.textContent = `
                button[aria-label*="Dev Tools"] {
                  display: none !important;
                }
              `;
              el.shadowRoot.appendChild(shadowStyle);
            }
          }
        });
      } catch (error) {
        // Silently fail
      }
    };

    // Initial removal
    removeDevTools();

    // Aggressive polling
    const interval = setInterval(removeDevTools, 25);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return null;
}
