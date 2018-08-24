import { AggregatedDataProvider } from '../provider/aggregated-data';
import { injectBefore, injectPrInfoBeforeDescription, hidePrInfo } from '../helper/injector';
import { buildUrl } from "../helper/url-builder";
import { ORIGIN_HARVEST } from '../origin';
import { getJiraOrigins } from '../provider/rpc';
import { BitbucketPrUrlParser } from '../provider/url-parser';

const HARVEST_TIMER_URL = `${ORIGIN_HARVEST}/platform/timer`;

const defaults = {
    harvestOriginUrl: ORIGIN_HARVEST,
    harvestTimerUrl: HARVEST_TIMER_URL,
};

type HarvestIframeOptions = typeof defaults;

export class HarvestIframe {
    dataProvider: AggregatedDataProvider;
    $iframe: HTMLIFrameElement;
    opts: HarvestIframeOptions;

    constructor(opts?: Partial<HarvestIframeOptions>){
        this.opts = { ...{}, ...defaults, ...opts };
        const urlParser = new BitbucketPrUrlParser();

        // only execute if we're on a pr page
        if(!urlParser.isPullRequest()){
            return;
        }

        injectPrInfoBeforeDescription('epic', 'Jira Epic', '...');
        injectPrInfoBeforeDescription('iframe', 'Harvest', '...');

        this.registerEvents();
        this.init();
    }

    async init(): Promise<void> {
        const origins = await getJiraOrigins();
        this.dataProvider = new AggregatedDataProvider(origins);
        await this.dataProvider.load();
        this.buildIframe();

        const epicTitles = this.dataProvider.issues.map(issue => issue.epicTitle);

        if(!this.dataProvider.userSettings.bitbucketDisplayEpics){
            hidePrInfo('epic');
        }

        if(!this.dataProvider.userSettings.bitbucketDisplayPriority){
            //hidePrInfo('priority');
        }

        injectPrInfoBeforeDescription(
            'epic',
            'Jira Epic',
            epicTitles
                .filter((issue, i, issues) => !!issue && issues.indexOf(issue) === i)
                .map(title => `<span class="aui-lozenge aui-lozenge-subtle">${title}</span>`)
                .join(' ') || '<span class="aui-lozenge aui-lozenge-subtle" title="Epic could not be found. Maybe it\'s a sub-issue?">?</span>'
        );
        injectPrInfoBeforeDescription('iframe', 'Harvest', this.$iframe);
    }

    registerEvents(): void {
        window.addEventListener('message', this.onHarvestMessage.bind(this));
    }

    onHarvestMessage(e: MessageEvent): void {
        if(e.origin !== this.opts.harvestOriginUrl){
            return;
        }

        if(e.data.type === 'frame:resize'){
            this.$iframe.style.height = e.data.value + 'px';
        }

        if(e.data.type === 'frame:load' && this.$iframe.contentWindow){
            this.setCustomHarvestData();
        }
    }

    async setCustomHarvestData(){
        this.postIframeMessage('set:epic', this.dataProvider.issues.map(issue => issue.epicTitle).filter(title => !!title));
        this.postIframeMessage('set:summary', this.dataProvider.getUserSummary());
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
            closable: false
        });
    }

    buildIframe(): void {
        let $iframe = this.$iframe;
        if(!$iframe){
            $iframe = document.createElement('iframe');
            $iframe.frameBorder = '0';
            $iframe.className = '__scn-harvest-iframe';
            $iframe.innerHTML = '...';
            this.$iframe = $iframe;
        }

        const src = this.buildIframeUrl();

        if($iframe.src === src){
            return;
        }

        $iframe.src = src;
    }

    postIframeMessage(type: string, value: any): void {
        if(!this.$iframe.contentWindow){
            throw new Error('Content window not yet ready');
        }

        this.$iframe.contentWindow.postMessage({
            type, value
        }, ORIGIN_HARVEST);
    }
}
