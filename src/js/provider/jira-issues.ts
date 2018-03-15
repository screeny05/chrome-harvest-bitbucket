import { fetchJson } from '../helper/fetch-json';

const EPIC_CUSTOMFIELD_ID = 'customfield_10008';

export interface JiraIssueData {
    issueKey: string;
    issueId: string;
    issueTitle: string;
    projectKey: string;
    projectId: string;
    projectTitle: string;
    epicTitle?: string;
    epicKey?: string;
    version: string;
}

const issueCache = new Map<string, JiraIssueData>();
const cacheIssues = (issues: JiraIssueData[]) => issues.forEach(issue => issueCache.set(issue.issueKey, issue));
const getUncachedKeys = (keys: string[]) => keys.filter(key => !issueCache.has(key));
const getCachedIssues = (keys: string[]): JiraIssueData[] => <JiraIssueData[]>keys.map(key => issueCache.get(key)).filter(issue => !!issue);
const getCachedIssue = (key: string) => issueCache.get(key);

const getEpicTitle = (epicKey: string, epics: JiraIssueData[]): string | null => {
    const epic = epics.find(epic => epic.issueKey === epicKey);
    return epic ? epic.issueTitle : null;
}

export async function getJiraIssueData(host: string, issueKeys: string[]): Promise<JiraIssueData[]> {
    if(issueKeys.length === 0){
        return [];
    }

    const uncachedKeys = getUncachedKeys(issueKeys);
    if(uncachedKeys.length === 0){
        return getCachedIssues(issueKeys);
    }

    const result = await fetchJson<jira.ISearch>(host + '/rest/api/2/search?jql=issueKey+in+(' + uncachedKeys.join(',') + ')');
    if(result.errorMessages){
        throw new Error(result.errorMessages.join('\n\n'));
    }

    const issueData: JiraIssueData[] = result.issues!.map(issue => {
        const { project } = issue.fields;

        return {
            issueKey: issue.key,
            issueId: issue.id,
            issueTitle: issue.fields.summary,
            projectKey: project.key,
            projectId: project.id,
            projectTitle: project.name,
            version: issue.fields.fixVersions[0].name,
            epicKey: issue.fields[EPIC_CUSTOMFIELD_ID]
        };
    });

    // cache first in case we already fetched an epic
    cacheIssues(issueData);

    const epicKeys = <string[]>issueData
        .map(issue => issue.epicKey)
        .filter((val, i, arr) => !!val && arr.indexOf(val) === i);

    const epics = await getJiraIssueData(host, epicKeys);

    issueData.forEach(issue => {
        if(!issue.epicKey){
            return;
        }

        const epicTitle = getEpicTitle(issue.epicKey, epics);

        if(!epicTitle){
            return;
        }

        issue.epicTitle = epicTitle;
    });
    cacheIssues(issueData);

    return getCachedIssues(issueKeys);
}
