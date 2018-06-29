export function getIssueKeysFromText(text: string): string[] {
    const match = text.match(/((\w|\d)+?-\d+)/g);
    if(!match){
        return [];
    }
    return match;
}
