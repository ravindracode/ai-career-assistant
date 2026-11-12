const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

async function parseError(response) {
  try {
    const data = await response.json();
    if (typeof data?.detail === "string") {
      return data.detail;
    }
    if (Array.isArray(data?.detail)) {
      return data.detail.map((item) => item.msg || JSON.stringify(item)).join(", ");
    }
  } catch {
    // Fall back to status text if response body isn't JSON.
  }
  return `Request failed with status ${response.status}`;
}

export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/`);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function fetchResumes() {
  const response = await fetch(`${API_BASE_URL}/resumes`);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  const data = await response.json();
  return data.resumes || [];
}

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function deleteResume(id) {
  const response = await fetch(`${API_BASE_URL}/resumes/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export { API_BASE_URL };

