import { fetchJson } from '../helper/fetch-json';
import pMap from 'p-map';

const EPIC_CUSTOMFIELD_IDS = ['customfield_10008', 'customfield_10006'];

export interface JiraIssueData {
    issueKey: string;
    issueId: string;
    issueTitle: string;
    projectKey: string;
    projectId: string;
    projectTitle: string;
    priority: jira.IIssuePriority;
    epicTitle?: string;
    epicKey?: string;
    version?: string;
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

export function mapSearchResultsToIssueData(result: jira.ISearch): JiraIssueData[] {
    if(result.errorMessages){
        throw new Error(result.errorMessages.join('\n\n'));
    }

    if(!result.issues){
        return [];
    }

    return result.issues.map(issue => {
        const { project } = issue.fields;

        const version = issue.fields.fixVersions && issue.fields.fixVersions.length > 0 ? issue.fields.fixVersions[0].name : null;

        const epicKey = EPIC_CUSTOMFIELD_IDS.map(id => issue.fields[id]).filter(key => !!key)[0];

        return {
            issueKey: issue.key,
            issueId: issue.id,
            issueTitle: issue.fields.summary,
            projectKey: project.key,
            projectId: project.id,
            projectTitle: project.name,
            version: version,
            priority: issue.fields.priority,
            epicKey
        };
    });
}

export async function getJiraIssueData(hosts: string[], issueKeys: string[]): Promise<JiraIssueData[]> {
    if(issueKeys.length === 0){
        return [];
    }

    const uncachedKeys = getUncachedKeys(issueKeys);
    if(uncachedKeys.length === 0){
        return getCachedIssues(issueKeys);
    }

    const results: jira.ISearch[] = await pMap(hosts, host =>
        fetchJson<jira.ISearch>(host + '/rest/api/2/search?jql=issueKey+in+(' + uncachedKeys.join(',') + ')')
    );

    const issueData = (<JiraIssueData[]>[]).concat(...results.map(result => mapSearchResultsToIssueData(result)));

    // cache first in case we already fetched an epic
    cacheIssues(issueData);

    const epicKeys = <string[]>issueData
        .map(issue => issue.epicKey)
        .filter((val, i, arr) => !!val && arr.indexOf(val) === i);

    const epics = await getJiraIssueData(hosts, epicKeys);

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
