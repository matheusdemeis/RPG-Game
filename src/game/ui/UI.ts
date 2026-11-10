export class UI {
  readonly root = document.querySelector<HTMLDivElement>('#ui')!;
  private controller = new AbortController();
  render(html: string) {
    this.controller.abort(); this.controller = new AbortController();
    this.root.innerHTML = html;
  }
  on(action: string, callback: () => void) {
    this.root.querySelectorAll<HTMLButtonElement>(`[data-action="${action}"]`).forEach(button => {
      button.addEventListener('click', callback, { signal: this.controller.signal });
    });
  }
  focus() { this.root.querySelector<HTMLButtonElement>('.modal button:not(:disabled), .title-menu button:not(:disabled)')?.focus({ preventScroll: true }); }
  clear() { this.render(''); }
}

export const button = (action: string, label: string, extra = '') => `<button type="button" data-action="${action}" ${extra}>${label}</button>`;
