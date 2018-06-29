export async function store(key: string, value: any, timeoutInMin: number = 60): Promise<void> {
    return new Promise<void>(resolve => {
        const timeout = new Date(Date.now() + 1000 * 60 * timeoutInMin);
        chrome.storage.local.set({
            [key]: value,
            [key + '_timeout']: timeout.getTime()
        }, () => resolve());
    });
}

export async function get<T>(key: string): Promise<T> {
    return new Promise<T>(resolve => {
        chrome.storage.local.get([key, key + '_timeout'], result => {
            const value = result[key];
            const timeout = result[key + '_timeout'];

            if(timeout > Date.now()){
                return resolve(value);
            }

            // clear cache if invalidated
            chrome.storage.local.remove([key, key + '_timeout'], () => {
                resolve(undefined);
            });
        });
    });
}
