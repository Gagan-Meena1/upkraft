// For Next.js, use NEXT_PUBLIC_ prefix for client-side environment variables
export const getApiBaseUrl = () => {
  // Check both Next.js and React environment variable patterns
  return process.env.NEXT_PUBLIC_API_BASE_URL || 
         process.env.REACT_APP_API_BASE_URL || 
         "";
};

export const apiUrl = (path) => {
  const base = (getApiBaseUrl() || "").replace(/\/+$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
};

// Generic fetch wrapper: includes cookies by default
export const apiFetch = (pathOrUrl, options = {}) => {
  const url = /^(https?:)?\/\//.test(pathOrUrl)
    ? pathOrUrl
    : apiUrl(pathOrUrl);
  
  const defaultOptions = {
    // Send cookies on same- and cross-site requests
    credentials: "include",
  };
  
  // Merge headers without clobbering
  const merged = {
    ...defaultOptions,
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options && options.headers ? options.headers : {}),
    },
  };
  
  return fetch(url, merged);
};