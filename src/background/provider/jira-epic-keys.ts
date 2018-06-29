import { get, store } from '../../background/provider/storage';
import { getJiraOrigins } from './jira-origins';

export async function getJiraEpicKeys(): Promise<string[]> {
    const origins = await getJiraOrigins();
}
