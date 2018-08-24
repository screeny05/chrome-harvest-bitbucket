import { getJiraIssueData, JiraIssueData } from './jira-issues';
import { getBitbucketPrCommits } from './bitbucket-commits';
import { BitbucketPrUrlParser } from './url-parser';
import { getIssueKeysFromText } from '../helper/issue-keys-from-text';
import { get } from '../../background/provider/storage';

interface UserSettings {
    entryPrefix: string;
    bitbucketDisplayEpics: boolean;
    bitbucketDisplayPriority: boolean;
}

export class AggregatedDataProvider {
    issueKeys: string[] = [];
    issues: JiraIssueData[] = [];
    urlData: BitbucketPrUrlParser;
    userSettings: UserSettings;

    static UserSettingsDefaults: UserSettings = {
        entryPrefix: '',
        bitbucketDisplayEpics: true,
        bitbucketDisplayPriority: false
    }

    constructor(private jiraHosts: string[]){
        this.urlData = new BitbucketPrUrlParser();
    }

    async load(){
        try {
            this.issueKeys = await this.findReferencedIssueKeys();
            this.issues = await getJiraIssueData(this.jiraHosts, this.issueKeys);
            await this.loadSettings();
        } catch (e){
            console.warn('Cannot fetch issues', e);
        }
    }

    async loadSettings(): Promise<void> {
        const defaults = AggregatedDataProvider.UserSettingsDefaults;
        this.userSettings = { ...defaults };
        await Promise.all(Object.keys(defaults).map(async (key) =>
            this.userSettings[key] = await this.loadSetting(key, defaults[key])
        ));
    }

    async loadSetting(key: string, defaultValue: any): Promise<void> {
        const val = await get<any>(key);
        if(typeof val === 'undefined' || val === null){
            return defaultValue;
        }
        return val;
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
    getUserSummary(): string {
        return (this.userSettings.entryPrefix || '') + this.getSummary();
    }
    getGroupId(): string {
        if(this.issues.length > 0){
            return this.issues[0].projectId;
        }
        return this.getRepoUrl();
    }
    getMainLink(): string {
        if(this.issues.length > 0){
            const [firstIssue] = this.issues;
            return firstIssue.host + '/browse/' + firstIssue.issueKey;
        }
        return this.urlData.getPullRequestMainLink();
    }
}
