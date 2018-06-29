import { HarvestIframe } from './service/harvest-iframe';
import { HarvestReceiver } from './service/harvest-receiver';
import { ORIGIN_BITBUCKET, ORIGIN_HARVEST } from './origin';

declare const $: any;

if(location.origin === ORIGIN_BITBUCKET){
    new HarvestIframe();
}

if(location.origin === ORIGIN_HARVEST){
    new HarvestReceiver();
}
