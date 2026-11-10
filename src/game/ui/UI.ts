export class UI {
  readonly root = document.querySelector<HTMLDivElement>('#ui')!;
  private controller = new AbortController();
  render(html: string) {
    this.controller.abort(); this.controller = new AbortController();
    this.root.innerHTML = html;
    const dialog=this.root.querySelector<HTMLElement>('.modal');
    if(dialog){
      dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');
      const heading=dialog.querySelector('h2');if(heading){heading.id='dialog-heading';dialog.setAttribute('aria-labelledby',heading.id);}
      dialog.addEventListener('keydown',(event:KeyboardEvent)=>{
        if(event.key!=='Tab')return;
        const buttons=[...dialog.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
        const first=buttons[0],last=buttons.at(-1);
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
      },{signal:this.controller.signal});
    }
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
