export function buildUrl(url: string, params: { [key: string]: string | boolean | number }): string {
    const paramString = Object.keys(params).map(key => {
        return key + '=' + encodeURIComponent(params[key] + '');
    }).join('&');
    const urlBase = url + (url.indexOf('?') === -1 ? '?' : '&');
    return urlBase + paramString;
}
