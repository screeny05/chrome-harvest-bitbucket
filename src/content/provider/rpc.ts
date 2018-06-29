export async function rpc<T>(type: string, data?: any): Promise<T> {
    return new Promise<T>(resolve => {
        chrome.runtime.sendMessage({ type, data }, res => {
            resolve(res);
        });
    });
}

export async function getJiraOrigins(): Promise<string[]> {
    return await rpc<string[]>('getJiraOrigins');
}

export async function getJiraEpicKeys(): Promise<string[]> {
    return await rpc<string[]>('getJiraEpicKeys');
}
