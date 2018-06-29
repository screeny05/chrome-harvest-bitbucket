<template>
    <div>
        <div v-if="isLoading">Loading...</div>
        <div v-else>
            Select epic-fields for enabled Jira-Instances.
            <button @click="reloadInstances">reload</button>
            <div v-for="instance in instances" :key="instance.key">
                <instance-fields :instance="instance"/>
            </div>

            <form @submit="addInstance">
                <input type="text" v-model="addInstanceUrl" placeholder="Add new Instance"/>
                <button type="submit">Add</button>
                <div v-if="invalidInstance">Invalid instance given</div>
            </form>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import pMap from 'p-map';
import { getJiraOrigins } from '../../background/provider/jira-origins';
import { getJiraMeta, JiraMetaData } from '../../background/provider/jira-meta';
import { store, get } from '../../background/provider/cache';
import { fetchJson } from '../../content/helper/fetch-json';

export default Vue.extend({
    data(){
        return {
            isLoading: false,
            instances: [],
            addInstanceUrl: '',
            invalidInstance: false
        }
    },
    async created(){
        const cachedInstances = await get<JiraMetaData[]>('instances');
        if(cachedInstances){
            this.instances.push(...cachedInstances);
        } else {
            this.reloadInstances();
        }
    },
    methods: {
        async reloadInstances(){
            this.isLoading = true;

            const origins = await getJiraOrigins();
            const instances = await pMap(origins, origin => getJiraMeta(origin));
            this.instances = instances;
            await store('instances', instances, 15);

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
                    await fetchJson(this.addInstanceUrl + '/rest/api/2/serverInfo')
                } catch(e) {
                    console.log(e);
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
        }
    }
});
</script>
