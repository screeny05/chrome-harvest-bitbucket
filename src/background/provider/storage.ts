export async function store(key: string, value: any): Promise<void> {
    return new Promise<void>(resolve => {
        chrome.storage.local.set({
            [key]: value,
        }, () => resolve());
    });
}

export async function get<T>(key: string): Promise<T> {
    return new Promise<T>(resolve => {
        chrome.storage.local.get([key], result => {
            return resolve(result[key]);
        });
    });
}
