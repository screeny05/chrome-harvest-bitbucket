import { get, store } from '../../background/provider/storage';
import { getJiraOrigins } from './jira-origins';

export async function getJiraEpicKeys(): Promise<string[]> {
    const origins = await getJiraOrigins();
    return <string[]>await Promise.all(origins.map(origin => get('epicfield-' + origin)));
}
