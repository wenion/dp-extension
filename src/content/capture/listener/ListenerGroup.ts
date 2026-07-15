export class ListenerGroup {

  private disposes: (() => void)[] = [];

  add(dispose: () => void) {
    this.disposes.push(dispose);
  }

  dispose() {
    for (const fn of this.disposes.reverse()) {
      fn();
    }

    this.disposes.length = 0;
  }

}
