import { AggregatedDataProvider } from '../provider/aggregated-data';
import { injectBefore, injectPrInfoBeforeDescription } from '../helper/injector';
import { buildUrl } from "../helper/url-builder";
import { observePrContentChange } from "./pr-content-observer";
import { ORIGIN_HARVEST } from '../origin';

const HARVEST_TIMER_URL = `${ORIGIN_HARVEST}/platform/timer`;

const defaults = {
    harvestOriginUrl: ORIGIN_HARVEST,
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

        injectPrInfoBeforeDescription('epic', 'Jira Epic', '...');
        injectPrInfoBeforeDescription('iframe', 'Harvest', '...');

        this.registerEvents();
        this.init();
    }

    async init(): Promise<void> {
        await this.dataProvider.load();
        this.buildIframe();

        const epicTitles = this.dataProvider.issues.map(issue => issue.epicTitle);

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
        observePrContentChange(this.onPrContentChange.bind(this));
    }

    onHarvestMessage(e: MessageEvent): void {
        if(e.origin !== this.opts.harvestOriginUrl){
            return;
        }

        if(e.data.type === 'frame:resize'){
            this.$iframe.style.height = e.data.value + 'px';
        }

        if(e.data.type === 'frame:load'){
            this.$iframe.contentWindow.postMessage({
                type: 'set:epic',
                value: this.dataProvider.issues.map(issue => issue.epicTitle).filter(title => !!title)
            }, ORIGIN_HARVEST);
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
            closable: false
        });
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

        $iframe.src = src;
    }
}
