import { fetchJson } from '../helper/fetch-json';
import pMap from 'p-map';
import { getJiraEpicKeys } from './rpc';

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
    host: string;
}

const issueCache = new Map<string, JiraIssueData>();
const cacheIssues = (issues: JiraIssueData[]) => issues.forEach(issue => issueCache.set(issue.issueKey, issue));
const getUncachedKeys = (keys: string[]) => keys.filter(key => !issueCache.has(key));
const getCachedIssues = (keys: string[]): JiraIssueData[] => <JiraIssueData[]>keys.map(key => issueCache.get(key)).filter(issue => !!issue);
const getCachedIssue = (key: string) => issueCache.get(key);

/**
 * Use as Array.prototype.filter callback to ensure given array is of unique T
 *
 * @param val
 * @param i
 * @param arr
 */
const filterUniqueElements = <T = string>(val: T | undefined, i: number, arr: (T | undefined)[]): val is T => !!val && arr.indexOf(val) === i;

const getEpicTitle = (epicKey: string, epics: JiraIssueData[]): string | null => {
    const epic = epics.find(epic => epic.issueKey === epicKey);
    return epic ? epic.issueTitle : null;
}

export function mapSearchResultsToIssueData(result: jira.ISearch, epicFields: string[]): JiraIssueData[] {
    if(result.errorMessages){
        throw new Error(result.errorMessages.join('\n\n'));
    }

    if(!result.issues){
        return [];
    }

    return result.issues.map(issue => {
        const { project } = issue.fields;

        const version = issue.fields.fixVersions && issue.fields.fixVersions.length > 0 ? issue.fields.fixVersions[0].name : null;

        const epicKey = epicFields.map(id => issue.fields[id]).filter(key => !!key)[0];

        const host = new URL(issue.self).origin;

        return {
            issueKey: issue.key,
            issueId: issue.id,
            issueTitle: issue.fields.summary,
            projectKey: project.key,
            projectId: project.id,
            projectTitle: project.name,
            version: version,
            priority: issue.fields.priority,
            epicKey,
            host
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

    const epicFields = await getJiraEpicKeys();

    const results: jira.ISearch[] = await pMap(hosts, host =>
        // validateQuery ensures we don't get 0 results for partially invalid keys
        fetchJson<jira.ISearch>(host + '/rest/api/2/search?validateQuery=false&jql=issueKey+in+(' + uncachedKeys.join(',') + ')')
    );

    const issueData = (<JiraIssueData[]>[]).concat(...results.map(result => mapSearchResultsToIssueData(result, epicFields)));

    // cache first in case we already fetched an epic
    cacheIssues(issueData);

    // ensure we only query hosts for epic-data which are hosts of the found issues
    const epicHosts = issueData
        .map(issue => issue.host)
        .filter(filterUniqueElements);
    const epicKeys = issueData
        .map(issue => issue.epicKey)
        .filter(filterUniqueElements);

    const epics = await getJiraIssueData(epicHosts, epicKeys);

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
