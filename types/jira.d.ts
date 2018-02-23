// (c) 2016 MIT, Robert Kaucher
// https://github.com/robertkaucher/jira-rest-typescript
declare namespace jira {
    export interface IAvatarUrls {
        "48x48": string;
        "24x24": string;
        "16x16": string;
        "32x32": string;
    }
    export interface IUser {
        self?: string;
        name: string;
        key?: string;
        emailAddress?: string;
        avatarUrls?: IAvatarUrls;
        displayName?: string;
        active?: boolean;
        timeZone?: string;
    }
    export interface IIssueType {
        self: string;
        id: string;
        description: string;
        iconUrl: string;
        name: string;
        subtask: boolean;
        avatarId: number;
    }
    export interface IProjectPartial {
        self: string;
        id: string;
        key: string;
        name: string;
        avatarUrls: IAvatarUrls;
    }
    export interface IProjectOptions {
        self?: string;
        id?: string;
        key: string;
        name?: string;
        avatarUrls?: IAvatarUrls;
    }
    export interface IProject {
        expand: string;
        self: string;
        id: string;
        key: string;
        description: string;
        lead: IUser;
        components: {
            self: string;
            id: string;
            name: string;
            isAssigneeTypeValid: boolean;
        }[];
        issueTypes: IIssueType[];
        assigneeType: string;
        versions: any[];
        name: string;
        roles: {
            "NewCommentClosed Notified": string;
            Administrators: string;
            Users: string;
            "Issue Updated Notified": string;
            "New Issue Notified": string;
        };
        avatarUrls: IAvatarUrls
        projectTypeKey: string;
    }
    export interface IAttachment {
        self: string;
        id: string;
        filename: string;
        author: IUser;
        created: string;
        size: number;
        mimeType: string;
        content: string;
    }
    export interface IAttachmentOptions {
        filename: string;
        mimeType?: string;
        content: string;
    }
    export interface IIssueStatus {
        self: string;
        description: string;
        iconUrl: string;
        name: string;
        id: string;
        statusCategory: {
            self: string;
            id: number;
            key: string;
            colorName: string;
            name: string;
        };
    }
    export interface IIssueTypeOptions {
        description?: string;
        iconUrl?: string;
        name: string;
        subtask?: boolean;
        avatarId?: number;
    }
    export interface IIssuePriority {
        self: string;
        iconUrl: string;
        name: string;
        id: string;
    }
    export interface IIssuePartial {
        id: string;
        key: string;
        self: string;
        fields: {
            summary: string;
            status: IIssueStatus;
            priority: IIssuePriority;
            issueType: IIssueType;
        }
    }
    export interface IIssueLink {
        id: string;
        self: string;
        type: {
            id: string;
            name: string;
            inward: string;
            outward: string;
            self: string;
        };
        outwardIssue?: IIssuePartial;
        innwardIssue?: IIssuePartial;
    }
    export interface IComment {
        self: string;
        id: string;
        author: IUser;
        body: string;
        updateAuthor: IUser;
        created: Date;
        updated: Date;
    }
    export interface IIssue {
        expand: string;
        id: string;
        self: string;
        key: string;
        fields: {
            aggregatetimespent: any;
            fixVersions: any[];
            customfield_11200: string;
            resolution: any;
            assignee: IUser,
            status: IIssueStatus;
            components: any[];
            aggregatetimeestimate: any;
            creator: IUser,
            subtasks?: IIssuePartial[];
            reporter: IUser,
            progress: {
                progress: number;
                total: number;
            };
            priority: IIssuePriority;
            issuetype: IIssueType;
            timespent: any;
            project: IProjectPartial,
            created: string;
            lastViewed: any;
            labels: any[];
            versions: any[];
            worklog: {
                startAt: number;
                maxResults: number;
                total: number;
                worklogs: any[];
            };
            watches: {
                self: string;
                watchCount: number;
                isWatching: boolean;
                watchers: IUser[];
            };
            workratio: number;
            updated: string;
            timeoriginalestimate: any;
            description: string;
            summary: string;
            environment: any;
            duedate: any;
            comment: {
                startAt: number;
                maxResults: number;
                total: number;
                comments: IComment[];
            }
            attachment: IAttachment[];
            issuelinks: IIssueLink[];
            //TODO: add custom fields
        };
    }

    export interface ISearch {
        errorMessages?: string[];
        issues?: jira.IIssue[];
    }
}
