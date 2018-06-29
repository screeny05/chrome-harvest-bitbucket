export async function fetchJson<T = any>(url: string): Promise<T> {
    const response = await fetch(url, {
        credentials: 'include'
    });
    return await response.json();
};
