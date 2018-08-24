import { fetchJson } from '../../content/helper/fetch-json';

export interface JiraMetaData {
    fields: jira.IField[];
    host: string;
    priorities: jira.IIssuePriority[];
}

export async function getJiraIssueFields(host: string): Promise<jira.IField[]> {
    const response = await fetchJson<jira.ICreateMeta>(host + '/rest/api/2/issue/createmeta?expand=projects.issuetypes.fields');

    // make sure fields are unique
    const foundFields = {};
    response.projects.forEach(project => {
        project.issuetypes.forEach(issueType => {
            const { fields } = issueType;
            if(!fields){
                return;
            }
            Object.keys(fields).forEach(fieldKey => {
                foundFields[fieldKey] = fields[fieldKey];
            });
        });
    });

    return Object.values(foundFields);
}

export async function getJiraIssuePriorities(host: string): Promise<jira.IIssuePriority[]> {
    return await fetchJson<jira.IIssuePriority[]>(host + '/rest/api/2/priority');
}

export async function getJiraMeta(host: string): Promise<JiraMetaData> {
    const fields = await getJiraIssueFields(host);
    const priorities = await getJiraIssuePriorities(host);

    return {
        fields,
        priorities,
        host
    };
}
