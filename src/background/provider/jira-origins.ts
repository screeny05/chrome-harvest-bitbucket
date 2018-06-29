export async function getJiraOrigins(): Promise<string[]> {
    return new Promise<string[]>(resolve => {
        chrome.permissions.getAll(permissions => {
            if(!permissions.origins){
                return resolve([]);
            }
            return resolve(
                permissions.origins
                    .filter(origin => origin.indexOf('*') === origin.length - 1)
                    .map(origin => origin.replace('/*', ''))
            );
        })
    });
}
