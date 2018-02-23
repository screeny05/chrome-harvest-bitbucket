export function injectScript(content: string): void {
    const ref = document.getElementsByTagName('script')[0];
    const script = document.createElement('script');
    script.text = content;
    injectBefore(script, ref);
};

export function injectBefore(el: Element, ref: Element): void {
    ref.parentNode!.insertBefore(el, ref);
}
