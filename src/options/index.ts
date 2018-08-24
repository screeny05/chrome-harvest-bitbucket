import Vue from 'vue';

import 'chrome-bootstrap/chrome-bootstrap.css';

import vSelect from 'vue-select'
import draggable from 'vuedraggable';
import Options from './components/options.vue';
import InstanceFields from './components/instance-fields.vue';

Vue.component('v-select', vSelect)
Vue.component('options', Options);
Vue.component('instance-fields', InstanceFields);
Vue.component('draggable', draggable);

new Vue({ el: '#app' });
