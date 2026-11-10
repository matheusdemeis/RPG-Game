export class DialogueSystem {
  private lines: string[] = [];
  private index = 0;
  speaker = '';
  private done?: () => void;
  get active() {
    return this.lines.length > 0;
  }
  get text() {
    return this.lines[this.index] ?? '';
  }
  get last() {
    return this.index === this.lines.length - 1;
  }
  start(speaker: string, lines: string[], done?: () => void) {
    this.speaker = speaker;
    this.lines = lines;
    this.index = 0;
    this.done = done;
  }
  advance() {
    if (!this.active) return;
    if (!this.last) {
      this.index++;
      return;
    }
    this.lines = [];
    const done = this.done;
    this.done = undefined;
    done?.();
  }
}
