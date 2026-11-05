import './dom';

/** O jsdom nao mede layout: da ao grafico (Recharts) um tamanho fixo para ele desenhar as linhas. */
class FixedResizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}
  observe(target: Element): void {
    const entry = { target, contentRect: { width: 800, height: 420 } } as ResizeObserverEntry;
    this.callback([entry], this as unknown as ResizeObserver);
  }
  unobserve(): void {}
  disconnect(): void {}
}

globalThis.ResizeObserver = FixedResizeObserver as unknown as typeof ResizeObserver;
const rect = { width: 800, height: 420, top: 0, left: 0, right: 800, bottom: 420, x: 0, y: 0 };
Element.prototype.getBoundingClientRect = () => ({ ...rect, toJSON: () => rect });
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 800 });
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 420 });
