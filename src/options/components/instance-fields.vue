<template>
    <div>
        <h4>{{ instance.host }}</h4>
        <v-select :options="instance.fields" label="name" multiple v-model="epicFields">
            <template slot="option" slot-scope="option">
                {{ option.name }} ({{ option.key }})
            </template>
        </v-select>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { get, store } from '../../background/provider/storage';

export default Vue.extend({
    props: ['instance'],
    data(){
        return {
            epicFields: []
        }
    },
    async created(){
        const selectedFields = await get<any[]>('epicfield-' + this.instance.host);
        this.epicFields = this.instance.fields.filter(field => selectedFields.indexOf(field.key) !== -1);
    },
    watch: {
        epicFields: function(){ this.storeSelectedEpicFields() }
    },
    methods: {
        async storeSelectedEpicFields(){
            await store('epicfield-' + this.instance.host, this.epicFields.map(epicField => epicField.key));
        }
    }
});
</script>
