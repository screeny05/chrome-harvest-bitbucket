import { fetchJson } from '../helper/fetch-json';

export interface BitbucketCommitData {
    hash: string;
    author: string;
    message: string;
}

export async function getBitbucketPrCommits(host, repoUrl, prId): Promise<BitbucketCommitData[]> {
    const result = await fetchJson<bitbucket.IPullRequestCommits>(`${host}/!api/2.0/repositories/${repoUrl}/pullrequests/${prId}/commits`);
    if(result.type === 'error'){
        throw new Error(result.error!.message + '\n' + result.error!.detail);
    }

    return result.values.map(commit => ({
        hash: commit.hash,
        author: commit.author.user.username,
        message: commit.message
    }));
}
