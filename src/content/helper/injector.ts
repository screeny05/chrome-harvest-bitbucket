export function injectScript(content: string): void {
    const ref = document.getElementsByTagName('script')[0];
    const script = document.createElement('script');
    script.text = content;
    injectBefore(script, ref);
};

export function injectBefore(el: Element, ref: Element): void {
    ref.parentNode!.insertBefore(el, ref);
}

export function injectPrInfoBeforeDescription(id: string, label: string, content: Element | string = ''): void {
    const idClass = '__scn-harvest-' + id;
    let $infoContainer = document.querySelector('#pull-request-diff-header .' + idClass);
    let $label: HTMLElement | null;
    let $content: HTMLElement | null;

    if($infoContainer){
        $label = $infoContainer.querySelector('dt');
        $content = $infoContainer.querySelector('dd');
    } else {
        const $injectBefore = getPrInfoDescription();
        if(!$injectBefore){
            return console.warn('cannot find pr info');
        }

        $infoContainer = document.createElement('div');
        $infoContainer.classList.add(idClass);
        injectBefore($infoContainer, $injectBefore);

        $label = document.createElement('dt');
        $infoContainer.appendChild($label);

        $content = document.createElement('dd');
        $infoContainer.appendChild($content);
    }

    if(!$label || !$content){
        return console.warn('cannot find or create info');
    }

    $label.textContent = label;

    if($content.children[0] === content){
        return;
    }

    $content.innerHTML = '';

    if(typeof content === 'string'){
        $content.innerHTML = content;
    } else {
        $content.appendChild(content);
    }
}

export function hidePrInfo(id: string): void {
    const idClass = '__scn-harvest-' + id;
    const $infoContainer = document.querySelector<HTMLElement>('#pull-request-diff-header .' + idClass);

    if(!$infoContainer){
        return;
    }

    $infoContainer.style.display = 'none';
}

export function getPrInfoDescription(): Element | null {
    const $description = document.querySelector('#pull-request-diff-header .description');
    if(!$description){
        console.warn('Cannot find injection destination');
        return null;
    }
    return $description;
}
