import { injectScript } from '../helper/injector';

export function observePrContentChange(cb: (tab: string) => void): void {
    injectScript(`
        const $prContent = $('#pr-tab-content');
        console.log($prContent);
        if($prContent.length === 0){
            throw new Error('Page is not a PR');
        }

        $prContent.on('pjax:success', (e, data, status, xhr, opts) => {
            const tab = opts.url.split('/').pop();
            window.postMessage({
                id: 'ext-harvest-bitbucket:pr-tab',
                tab: tab
            }, '*');
        });
    `);

    window.addEventListener('message', (e) => {
        const { data } = e;
        if(!data || !data.id || data.id !== 'ext-harvest-bitbucket:pr-tab'){
            return;
        }
        cb(data.tab.split('?')[0]);
    });
};
