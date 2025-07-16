import apiService from "@/infrastructure/api/ApiService.ts";

// --- JAVA VERSIONS ---
export async function getAllJavaVersions() {
    const response = await apiService.get(`java/versions`);
    return response.data;
}

export async function getJavaVersionById(id: number) {
    const response = await apiService.get(`java/versions/${id}`);
    return response.data;
}

export async function postJavaVersion(version: string, fileName: string, jar: File) {
    const formData = new FormData();
    formData.append('version', version);
    formData.append('fileName', fileName);
    formData.append('jar', jar);
    await apiService.post(`java/version`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

export async function updateJavaVersion(id: number, data: { version?: string; fileName?: string }) {
    await apiService.put(`java/versions/${id}`, data);
}

export async function deleteJavaVersion(id: number) {
    await apiService.delete(`java/versions/${id}`);
}

// --- JAVA PLUGINS ---
export async function getAllJavaPlugins() {
    const response = await apiService.get(`java/plugins`);
    return response.data;
}

export async function getJavaPluginById(id: number) {
    const response = await apiService.get(`java/plugins/${id}`);
    return response.data;
}

export async function postJavaPlugin(name: string, version: string, description: string, jar: File) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('version', version);
    formData.append('description', description);
    formData.append('jar', jar);
    await apiService.post(`java/plugins`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

export async function updateJavaPlugin(id: number, data: { name?: string; version?: string; description?: string; fileName?: string }) {
    await apiService.put(`java/plugins/${id}`, data);
}

export async function deleteJavaPlugin(id: number) {
    await apiService.delete(`java/plugins/${id}`);
}

