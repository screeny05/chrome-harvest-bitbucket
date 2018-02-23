declare namespace bitbucket {
    export interface IRequest {
        type?: string;
        error?: {
            message: string;
            detail: string;
        };
    }

    export interface IRequestPaginated extends IRequest {
        pagelen?: number;
        page?: number;
        size?: number;
    }

    export interface IPullRequestCommits extends IRequestPaginated {
        values: ICommit[];
    }

    export interface ICommit {
        type: 'commit';
        hash: string;
        repository: IRepository;
        links: any;
        author: IAuthor;
        parents: any;
        message: string;
        date: string;
    }

    export interface IRepository {
        type: 'repository';
        name: string;
        full_name: string;
        uuid: string;
    }

    export interface IAuthor {
        type: 'author';
        raw: string;
        user: IUser;
    }

    export interface IUser {
        type: 'user';
        username: string;
        display_name: string;
        uuid: string;
        links: any;
    }
}
