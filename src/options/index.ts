import Vue from 'vue';

import vSelect from 'vue-select'
import Options from './components/options.vue';
import InstanceFields from './components/instance-fields.vue';

Vue.component('v-select', vSelect)
Vue.component('options', Options);
Vue.component('instance-fields', InstanceFields);

new Vue({ el: '#app' });
