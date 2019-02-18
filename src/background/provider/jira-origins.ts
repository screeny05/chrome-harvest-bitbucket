import { get } from "./storage";

export async function getJiraOrigins(): Promise<string[]> {
    return get('instances', []);
}
