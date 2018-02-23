import { AggregatedDataProvider } from '../provider/aggregated-data';
import { injectBefore } from '../helper/injector';
import { buildUrl } from "../helper/url-builder";
import { observePrContentChange } from "./pr-content-observer";

const HARVEST_ORIGIN_URL = 'https://platform.harvestapp.com';
const HARVEST_TIMER_URL = `${HARVEST_ORIGIN_URL}/platform/timer`;

const defaults = {
    harvestOriginUrl: HARVEST_ORIGIN_URL,
    harvestTimerUrl: HARVEST_TIMER_URL,
    jiraOriginUrl: 'https://bestit.atlassian.net',
};

type HarvestIframeOptions = typeof defaults;

export class HarvestIframe {
    dataProvider: AggregatedDataProvider;
    $iframe: HTMLIFrameElement;
    opts: HarvestIframeOptions;

    constructor(opts?: Partial<HarvestIframeOptions>){
        this.opts = { ...{}, ...defaults, ...opts };
        this.dataProvider = new AggregatedDataProvider(this.opts.jiraOriginUrl);

        // only execute if we're on a pr page
        if(!this.dataProvider.urlData.isPullRequest()){
            return;
        }

        this.registerEvents();
        this.init();
    }

    async init(): Promise<void> {
        await this.dataProvider.load();
        this.buildIframe();
        this.injectIframe();
    }

    registerEvents(): void {
        window.addEventListener('message', this.onHarvestMessage.bind(this));
        observePrContentChange(this.onPrContentChange.bind(this));
    }

    onHarvestMessage(e: MessageEvent): void {
        if(e.origin !== this.opts.harvestOriginUrl){
            return;
        }

        if(e.data.type === 'frame:resize'){
            this.$iframe.style.height = e.data.value + 'px';
        }
    }

    onPrContentChange(tab: string): void {
        if(tab !== 'diff'){
            return;
        }
        this.init();
    }

    // https://github.com/harvesthq/platform/blob/master/widget.md
    buildIframeUrl(): string {
        return buildUrl(this.opts.harvestTimerUrl, {
            app_name: 'Bitbucket',
            service: 'bitbucket.org',
            external_item_id: this.dataProvider.getItemId(),
            external_item_name: this.dataProvider.getSummary(),
            external_group_id: this.dataProvider.getGroupId(),
            permalink: this.dataProvider.getMainLink(),
            chromeless: true,
            closeable: false
        });
    }

    injectIframe(): void {
        const $insertAfter = this.getInjectionDestination();
        const isInjected = document.querySelector('#pull-request-diff-header .__scn-harvest-iframe');
        if(!$insertAfter || isInjected){
            return;
        }

        injectBefore(this.$iframe, $insertAfter);
    }

    getInjectionDestination(): Element | null {
        const $description = document.querySelector('#pull-request-diff-header .description');
        if(!$description){
            console.warn('Cannot find injection destination');
            return null;
        }
        return $description;
    }

    buildIframe(): void {
        let $iframe = this.$iframe;
        if(!$iframe){
            $iframe = document.createElement('iframe');
            $iframe.frameBorder = '0';
            $iframe.className = '__scn-harvest-iframe';
            this.$iframe = $iframe;
        }

        const src = this.buildIframeUrl();

        if($iframe.src === src){
            return;
        }
        console.log('change');
        console.log($iframe.src);
        console.log(src);

        $iframe.src = src;
    }
}
