import { fetchJson } from '../helper/fetch-json';

export interface JiraIssueData {
    issueKey: string;
    issueId: string;
    issueTitle: string;
    projectKey: string;
    projectId: string;
    projectTitle: string;
}

export async function getJiraIssueData(host: string, issueKeys: string[]): Promise<JiraIssueData[]> {
    const result = await fetchJson<jira.ISearch>(host + '/rest/api/2/search?jql=issueKey+in+(' + issueKeys.join(',') + ')');
    if(result.errorMessages){
        throw new Error(result.errorMessages.join('\n\n'));
    }

    return result.issues!.map(issue => {
        const { project } = issue.fields;

        return {
            issueKey: issue.key,
            issueId: issue.id,
            issueTitle: issue.fields.summary,
            projectKey: project.key,
            projectId: project.id,
            projectTitle: project.name
        };
    });
}
