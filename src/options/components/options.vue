<template>
    <div class="frame">
        <div v-if="isLoading">Loading...</div>
        <div v-else>
            <header>
                <h1>Jira Instances</h1>
            </header>
            <div class="content">
                <p>
                    Select epic-fields for enabled Jira-Instances.
                </p>
                <button @click="reloadInstances">Reload Field Data</button>
                <div v-for="instance in instances" :key="instance.key">
                    <instance-fields :instance="instance" @deleted="reloadInstances"/>
                </div>

                <form @submit="addInstance">
                    <p>Add new Jira Instance</p>
                    <input type="text" v-model="addInstanceUrl" placeholder="URL"/>
                    <button type="submit">Add</button>
                    <div v-if="invalidInstance" class="alert" style="margin-top: 10px">Invalid instance given</div>
                </form>
            </div>

            <header>
                <h1>Harvest Options</h1>
            </header>
            <div class="content">
                <p>Set Harvest Entry Prefix</p>
                <form @submit="setEntryPrefix">
                    <input type="text" v-model="entryPrefix" placeholder="Prefix"/>
                    <button type="submit">Set</button>
                </form>

                <p>Minimal Booking Time</p>
                <form @submit="setEntryMinTime">
                    <input type="number" v-model="entryMinTime" placeholder="Prefix"/>
                    <button type="submit">Set</button>
                </form>
            </div>

            <header>
                <h1>Bitbucket Display Options</h1>
            </header>
            <div class="content" @change="setBitbucketOptions">
                <div class="checkbox">
                    <label>
                        <input type="checkbox" v-model="bitbucketDisplayPriority" placeholder="Prefix"/>
                        <span>Show Priority Badge</span>
                    </label>
                </div>

                <div class="checkbox">
                    <label>
                        <input type="checkbox" v-model="bitbucketDisplayEpics" placeholder="Prefix"/>
                        <span>Show Epics</span>
                    </label>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import pMap from 'p-map';
import { getJiraOrigins } from '../../background/provider/jira-origins';
import { getJiraMeta, JiraMetaData } from '../../background/provider/jira-meta';
import { store as cacheStore, get as cacheGet } from '../../background/provider/cache';
import { store as storageStore, get as storageGet } from '../../background/provider/storage';
import { fetchJson } from '../../content/helper/fetch-json';

export default Vue.extend({
    data(){
        return {
            isLoading: false,
            instances: [],
            addInstanceUrl: '',
            entryPrefix: '',
            entryMinTime: 0,
            invalidInstance: false,
            bitbucketDisplayEpics: true,
            bitbucketDisplayPriority: false
        }
    },
    async created(){
        const cachedInstances = await cacheGet<JiraMetaData[]>('instances');
        this.entryPrefix = await storageGet('entryPrefix', 'QA ');
        this.entryPrefix = this.entryPrefix.trim();
        this.entryMinTime = await storageGet<string>('entryMinTime');
        this.bitbucketDisplayPriority = await storageGet('bitbucketDisplayPriority');
        this.bitbucketDisplayEpics = await storageGet('bitbucketDisplayEpics');
        if(cachedInstances){
            this.instances.push(...cachedInstances);
        } else {
            await this.reloadInstances();
        }
    },
    methods: {
        async reloadInstances(){
            this.isLoading = true;

            const origins = await getJiraOrigins();
            const instances = await pMap(origins, origin => getJiraMeta(origin));
            this.instances = instances;
            await cacheStore('instances', instances, 15);

            this.isLoading = false;
        },
        addInstance(e){
            e.preventDefault();
            this.isLoading = true;
            this.invalidInstance = false;
            let origin;

            try {
                origin = new URL(this.addInstanceUrl).origin;
            } catch(e){
                this.invalidInstance = true;
                this.isLoading = false;
                return;
            }

            const originPerm = `${origin}/*`;
            chrome.permissions.request({
                origins: [originPerm]
            }, async (granted) => {
                if(!granted){
                    return;
                }
                try {
                    await fetchJson(this.addInstanceUrl + '/rest/api/2/serverInfo');
                    const instances = await getJiraOrigins();
                    instances.push(this.addInstanceUrl);
                    storageStore('instances', instances);
                } catch(e) {
                    this.isLoading = false;
                    this.invalidInstance = true;
                    chrome.permissions.remove({
                        origins: [origin]
                    });
                    return;
                }

                this.addInstanceUrl = '';
                this.reloadInstances();
            });
        },
        async setEntryPrefix(e){
            e.preventDefault();
            await storageStore('entryPrefix', this.entryPrefix.trim() + ' ');
        },
        async setEntryMinTime(e){
            e.preventDefault();
            await storageStore('entryMinTime', Number.parseInt(this.entryMinTime));
        },
        async setBitbucketOptions(e){
            await storageStore('bitbucketDisplayPriority', this.bitbucketDisplayPriority);
            await storageStore('bitbucketDisplayEpics', this.bitbucketDisplayEpics);
        }
    }
});
</script>
