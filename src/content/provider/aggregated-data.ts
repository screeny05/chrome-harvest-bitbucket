import { getJiraIssueData, JiraIssueData } from './jira-issues';
import { getBitbucketPrCommits, BitbucketCommitData } from './bitbucket-commits';
import { BitbucketPrUrlParser } from './url-parser';
import { getIssueKeysFromText } from '../helper/issue-keys-from-text';

export class AggregatedDataProvider {
    issueKeys: string[] = [];
    issues: JiraIssueData[] = [];
    urlData: BitbucketPrUrlParser;

    constructor(private jiraHosts: string[]){
        this.urlData = new BitbucketPrUrlParser();
    }

    async load(){
        try {
            this.issueKeys = await this.findReferencedIssueKeys();
            this.issues = await getJiraIssueData(this.jiraHosts, this.issueKeys);
        } catch (e){
            console.warn('Cannot fetch issues', e);
        }
    }

    async findReferencedIssueKeys(){
        const keys: string[] = [];

        // issue keys from jira connector plugin
        Array.from(document.querySelectorAll('[data-plugin-key^="jira-bitbucket-connector-plugin"]')).forEach(link => {
            if(!link || !link.textContent){
                return;
            }
            keys.push(link.textContent.trim());
        });

        // issue keys from commit-messages
        try {
            const commits = await getBitbucketPrCommits(this.urlData.getApiBase(), this.getRepoUrl(), this.getPrId());
            commits.forEach(commit => {
                keys.push(...getIssueKeysFromText(commit.message));
            });
        } catch (e){
            console.warn('Cannot fetch commits', e);
        }

        // return unique non-null strings
        return keys.filter((val, i) => val && keys.indexOf(val) === i);
    }

    getRepoUrl(): string {
        return this.urlData.getRepoUrl();
    }
    getPrId(): string {
        return this.urlData.getPullRequestId();
    }
    getItemId(): string {
        if(this.issues.length > 0){
            return this.issues[0].issueId;
        }
        if(this.issueKeys.length > 0){
            return this.issueKeys[0];
        }
        return this.getPrId();
    }
    getSummary(): string {
        if(this.issues.length > 0){
            return this.issues.map(issue => issue.issueKey + ' ' + issue.issueTitle).join('\n');
        }
        return this.issueKeys.join(' ');
    }
    getGroupId(): string {
        if(this.issues.length > 0){
            return this.issues[0].projectId;
        }
        return this.getRepoUrl();
    }
    getMainLink(): string {
        if(this.issues.length > 0){
            console.log(this.issues)
            //return this.jiraHost + '/browse/' + this.issues[0].issueKey;
        }
        return this.urlData.getPullRequestMainLink();
    }
}
