import domainPermissionToggle from 'webext-domain-permission-toggle';
import { getJiraOrigins } from './provider/jira-origins';
import { getJiraMeta } from './provider/jira-meta';
import { getJiraEpicKeys } from './provider/jira-epic-keys';

domainPermissionToggle.addContextMenu({
    reloadOnSuccess: false
});


chrome.runtime.onMessage.addListener((req: { type: string, data?: any }, sender, respond) => {
    const { type, data } = req;

    if(type === 'getJiraOrigins'){
        getJiraOrigins().then(origins => respond(origins));
    } else if(type === 'getJiraMeta'){
        getJiraMeta(data.host).then(meta => respond(meta));
    } else if(type === 'getJiraEpicKeys'){
        getJiraEpicKeys().then(meta => respond(meta));
    }

    // indicate async response
    return true;
});
