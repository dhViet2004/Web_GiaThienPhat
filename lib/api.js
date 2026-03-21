/**
 * Safe JSON fetch utility
 * Checks HTTP status before attempting to parse JSON
 * Throws descriptive errors instead of cryptic "Unexpected token '<'"
 */

export async function fetchJSON(url, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      let errorMessage = `HTTP Error: ${res.status} ${res.statusText}`;
      try {
        const errorData = await res.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // Response might not be JSON, use status text instead
      }
      throw new Error(errorMessage);
    }

    const text = await res.text();
    if (!text.trim()) {
      return null;
    }
    return JSON.parse(text);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON response from ${url}. The server may be returning an error page instead of JSON.`);
    }
    throw error;
  }
}

/**
 * Safe GET request
 */
export async function apiGet(url) {
  return fetchJSON(url);
}

/**
 * Safe POST request
 */
export async function apiPost(url, data) {
  return fetchJSON(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Safe PUT request
 */
export async function apiPut(url, data) {
  return fetchJSON(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Safe DELETE request
 */
export async function apiDelete(url) {
  return fetchJSON(url, {
    method: 'DELETE',
  });
}
