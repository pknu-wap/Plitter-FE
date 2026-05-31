export const API_BASE_URL = "/api";

export async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
