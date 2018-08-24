export const REGEX_ISSUE_KEY = /(\w+?-\d+)/g;
export const REGEX_EPIC_KEY = /(\w+?-\d+(-\w+)?)/g;

export function getAllTextMatches(regex: RegExp, text: string): string[] {
    const match = text.match(regex);
    if(!match){
        return [];
    }
    return match;
}

/**
 * Get all issuekey-like strings from a given text.
 * The issuekey may look like FOO-123, SW5XY-123, etc
 *
 * @param text
 */
export const getIssueKeysFromText: (text: string) => string[] = getAllTextMatches.bind(null, REGEX_ISSUE_KEY);

/**
 * Get all issuekey-like strings from a given text.
 * The issuekey may look like FOO-123, FOO-456-FE, SW5XY-123, etc
 *
 * @param text
 */
export const getEpicKeysFromText: (text: string) => string[] = getAllTextMatches.bind(null, REGEX_EPIC_KEY);
