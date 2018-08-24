import { getIssueKeysFromText, getEpicKeysFromText } from '../helper/issue-keys-from-text';
import { injectScript } from '../helper/injector';
import flat from 'array.prototype.flat';

interface HarvestAssignment {
    billable: number;
}

interface HarvestAssignmentMap {
    [key: string]: HarvestAssignment;
}

interface HarvestProject {
    name: string;
    id: number;
    code: string;
    client_id: number;
    task_assignments: HarvestAssignmentMap;
}

export class HarvestReceiver {
    projectData: HarvestProject[];

    constructor(){
        this.projectData = this.getProjectData();

        this.registerEvents();
        window.parent.postMessage({ type: 'frame:load' }, 'https://bitbucket.org');
    }

    registerEvents(){
        window.addEventListener('message', this.onMessage.bind(this));
    }

    onMessage(e){
        if(e.origin !== 'https://bitbucket.org'){
            return;
        }

        if(e.data.type === 'set:epic'){
            this.setEpic(getEpicKeysFromText(e.data.value.join(', ')));
        }

        if(e.data.type === 'set:summary'){
            this.setSummary(e.data.value);
        }
    }

    getProjectData(): HarvestProject[] {
        const $projectData = document.querySelector('#projects-data-island');
        if(!$projectData || !$projectData.textContent){
            throw new Error('Projectdata not found');
        }

        const projectDataMap: { [key: string]: HarvestProject } = JSON.parse($projectData.textContent);
        return Object.keys(projectDataMap).map(key => projectDataMap[key]);
    }

    setEpic(keys: string[]): void {
        let project = this.getProjectByEpicKeys(keys);

        // if not found try again, this time more fuzzy
        if(!project){
            project = this.getProjectByEpicKeys(this.getEpicKeysFuzzy(keys));
        }
        if(!project){
            return;
        }
        this.setProjectById(project.id);
    }

    getProjectByEpicKeys(keys: string[]): HarvestProject | undefined {
        return this.projectData.find(project => keys.includes(project.code));
    }

    /**
     * Transforms keys like INTPST-606-FE to INTPST-606 to accommodate
     * for not-directly mapping epic keys.
     *
     * @param keys
     */
    getEpicKeysFuzzy(keys: string[]): string[] {
        return flat(keys.map(key => getIssueKeysFromText(key)));
    }

    setProjectById(id: number): void {
        injectScript(`$('.js-project-selector').val(${JSON.stringify(id)}).trigger('chosen:updated').change();`);
    }

    setSummary(summary: string): void {
        injectScript(`$('.js-notes').val(${JSON.stringify(summary)});`);
    }
}
