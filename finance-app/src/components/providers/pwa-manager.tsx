"use client";

import { useEffect } from "react";

export function PWAManager() {
  useEffect(() => {
    // Basic mobile detection logic
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    
    if (isMobile) {
      // Add manifest link dynamically
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = '/manifest.json';
      document.head.appendChild(link);

      // Add apple-touch-icon
      const appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      appleLink.href = '/codeguide-logo.png';
      document.head.appendChild(appleLink);
    }
  }, []);

  return null;
}
