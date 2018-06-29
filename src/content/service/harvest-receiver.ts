import { getIssueKeysFromText } from '../helper/issue-keys-from-text';
import { injectScript } from '../helper/injector';

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

interface HarvestProjectMap {
    [key: string]: HarvestProject;
}

export class HarvestReceiver {
    projectData: HarvestProjectMap;

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
            this.setEpic(getIssueKeysFromText(e.data.value.join(', ')));
        }
    }

    getProjectData(): HarvestProjectMap {
        const $projectData = document.querySelector('#projects-data-island');
        if(!$projectData || !$projectData.textContent){
            throw new Error('Projectdata not found');
        }

        return JSON.parse($projectData.textContent);
    }

    setEpic(keys: string[]): void {
        const key = Object.keys(this.projectData).find(projectKey => keys.indexOf(this.projectData[projectKey].code) !== -1);
        if(!key){
            return;
        }
        this.setProjectByKey(key);
    }

    setProjectByKey(key: string): void {
        injectScript(`$('.js-project-selector').val(${JSON.stringify(key)}).trigger('chosen:updated').change();`);
    }
}
