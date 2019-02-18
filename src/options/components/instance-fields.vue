<style>
.chrome-bootstrap .frame .view,
.chrome-bootstrap .frame .content {
    overflow: visible;
    padding-top: 0;
}

.chrome-bootstrap header {
    position: relative;
}

.chrome-bootstrap .highlightable.draggable .handle {
    height: auto;
    bottom: 4px;
}

.v-select .selected-tag .close {
    min-height: 0;
    min-width: 0;
}
</style>

<template>
    <section>
        <h3>Host: {{ instance.host }}</h3>
        <button @click="deleteInstance">Delete Host</button>
        <p>Please select all fields which contain the epic-number</p>
        <v-select :options="instance.fields" label="name" multiple v-model="epicFields">
            <template slot="option" slot-scope="option">
                {{ option.name }} ({{ option.key }})
            </template>
        </v-select>
    </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { get, store } from '../../background/provider/storage';
import { getJiraOrigins } from '../../background/provider/jira-origins';

export default Vue.extend({
    props: ['instance'],
    data(){
        return {
            epicFields: [],
        }
    },
    async created(){
        const selectedFields = await get<any[]>('epicfield-' + this.instance.host, []);
        this.epicFields = this.instance.fields.filter(field => selectedFields.indexOf(field.key) !== -1);
    },
    watch: {
        epicFields: function(){ this.storeSelectedEpicFields() }
    },
    methods: {
        async storeSelectedEpicFields(){
            await store('epicfield-' + this.instance.host, this.epicFields.map(epicField => epicField.key));
        },
        async deleteInstance(){
            const origins = await getJiraOrigins();
            const newInstances = origins.filter(origin => origin !== this.instance.host);
            await store('instances', newInstances);
            this.$emit('deleted');
        }
    }
});
</script>
