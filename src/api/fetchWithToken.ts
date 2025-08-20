// src/api/fetchWithToken.ts

export async function fetchWithToken(
  url: string,
  options: RequestInit = {}
): Promise<Response | void> {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: "Bearer " + token } : {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Guardar mensaje opcional para mostrar en login
      localStorage.setItem("logoutMessage", "Tu sesión ha expirado. Por favor inicia sesión.");

      // Redireccionar al login
      window.location.href = "/login";

      // Detener ejecución
      return;
    }

    return response;
  } catch (error) {
    console.error("Error en fetchWithToken:", error);
    throw error;
  }
}
