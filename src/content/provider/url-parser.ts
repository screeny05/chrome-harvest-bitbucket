// borrowed from https://github.com/refined-bitbucket/refined-bitbucket/blob/dev/src/page-detect.js
export class BitbucketPrUrlParser {
    constructor(private origin = location.origin, private path = location.pathname){ }

    isPullRequest(): boolean {
        return /^pull-requests\/\d+/.test(this.getRepoPath());
    }

    getCleanPathname(): string {
        return this.path.replace(/^[/]|[/]$/g, '');
    }

    getRepoPath(): string {
        const match = /^[^/]+[/][^/]+[/]?(.*)$/.exec(this.getCleanPathname());
        if(!match){
            throw new Error('Unable to retrieve Repo Path');
        }
        return match[1];
    }

    getRepoUrl(): string {
        return this.path.slice(1).split('/', 2).join('/');
    }

    getPullRequestId(): string {
        const match = /^pull-requests\/(\d+)/.exec(this.getRepoPath());
        if(!match){
            throw new Error('Unable to retrieve PR ID');
        }
        return match[1];
    }

    getPullRequestMainLink(): string {
        return this.origin + this.getRepoUrl() + '/pull-requests/' + this.getPullRequestId();
    }

    getApiBase(): string {
        return this.origin;
    }
}
