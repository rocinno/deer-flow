// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { env } from "~/env";

export function resolveServiceURL(path: string) {
  // Use CORS proxy as a workaround for CORS issues
  // Proxy server running on port 3001
  return `http://34.136.71.19:3001/proxy/api/${path}`;
  
  /* Original code commented out for easy reverting if needed
  // Use relative URLs to leverage Next.js proxy
  if (env.NEXT_PUBLIC_API_URL) {
    // If an explicit API URL is provided, use it
    let BASE_URL = env.NEXT_PUBLIC_API_URL;
    if (!BASE_URL.endsWith("/")) {
      BASE_URL += "/";
    }
    return new URL(path, BASE_URL).toString();
  } else {
    // Otherwise use relative URL to work with Next.js proxy
    return `/api/${path}`;
  }
  */
}
