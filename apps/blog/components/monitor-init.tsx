"use client";

import { useEffect } from "react";
import { init } from "@monitor/sdk";

let initialized = false;

export function MonitorInit() {
  useEffect(() => {
    const endpoint = process.env.NEXT_PUBLIC_MONITOR_ENDPOINT;
    console.log('endpoint', endpoint);
    if (!endpoint || initialized) return;

    initialized = true;

    console.log('init monitor', endpoint);
    init({
      endpoint,
      appId: process.env.NEXT_PUBLIC_MONITOR_APP_ID ?? "blog",
      env: process.env.NODE_ENV,
      release: process.env.NEXT_PUBLIC_APP_RELEASE,
      platform: "auto",
      sampleRate: 1,
      performance: {
        webVitals: true,
        navigation: true,
        slowResourceThreshold: 1000,
      },
      blankScreen: {
        delay: 3000,
        minVisibleNodes: 1,
      },
      breadcrumb: {
        navigation: true,
        dom: true,
        console: process.env.NODE_ENV === "development",
      },
      request: {
        slowThreshold: 3000,
      },
      replay: {
        enabled: true,
        maskAllInputs: true,
      }
    });
  }, []);

  return null;
}
