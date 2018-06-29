import { fetchJson } from '../../content/helper/fetch-json';

export interface JiraMetaData {
    projectKeys: string[];
    fields: jira.IField[];
    host: string;
}

export async function getJiraMeta(host: string): Promise<JiraMetaData> {
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

    return {
        projectKeys: response.projects.map(project => project.key),
        fields: Object.values(foundFields),
        host
    };
}
