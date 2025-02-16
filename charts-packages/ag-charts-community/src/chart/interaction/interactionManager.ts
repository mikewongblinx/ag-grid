type InteractionTypes = 'click' | 'hover' | 'drag-start' | 'drag' | 'drag-end' | 'leave';
type Listener<T extends InteractionTypes> = {
    symbol?: Symbol;
    handler: (event: InteractionEvent<T>) => void;
};

type SUPPORTED_EVENTS =
    | 'click'
    | 'mousedown'
    | 'mousemove'
    | 'mouseup'
    | 'mouseout'
    | 'touchstart'
    | 'touchmove'
    | 'touchend'
    | 'touchcancel';
const EVENT_HANDLERS: SUPPORTED_EVENTS[] = [
    'click',
    'mousedown',
    'mousemove',
    'mouseup',
    'mouseout',
    'touchstart',
    'touchmove',
    'touchend',
    'touchcancel',
];

export type InteractionEvent<T extends InteractionTypes> = {
    type: T;
    offsetX: number;
    offsetY: number;
    pageX: number;
    pageY: number;
    sourceEvent: Event;
} & (T extends 'drag' ? { startX: number; startY: number } : {});

const CSS = `
.ag-chart-wrapper {
    touch-action: none;
}
`;

/**
 * Manages user interactions with a specific HTMLElement (or interactions that bubble from it's
 * children)
 */
export class InteractionManager {
    private static interactionDocuments: Document[] = [];

    private readonly rootElement: HTMLElement;
    private readonly element: HTMLElement;

    private registeredListeners: Partial<{ [I in InteractionTypes]: Listener<I>[] }> = {};
    private eventHandler = (event: MouseEvent | TouchEvent | Event) => this.processEvent(event);

    private mouseDown = false;
    private touchDown = false;

    public constructor(element: HTMLElement, doc = document) {
        this.rootElement = doc.body;
        this.element = element;

        for (const type of EVENT_HANDLERS) {
            element.addEventListener(type, this.eventHandler);
        }

        if (InteractionManager.interactionDocuments.indexOf(doc) < 0) {
            const styleElement = document.createElement('style');
            styleElement.innerHTML = CSS;
            document.head.insertBefore(styleElement, document.head.querySelector('style'));
            InteractionManager.interactionDocuments.push(doc);
        }
    }

    public addListener<T extends InteractionTypes>(type: T, cb: (event: InteractionEvent<T>) => void): Symbol {
        const symbol = Symbol(type);

        if (!this.registeredListeners[type]) {
            this.registeredListeners[type] = [];
        }

        this.registeredListeners[type]?.push({ symbol, handler: cb as any });

        return symbol;
    }

    public removeListener(listenerSymbol: Symbol) {
        Object.entries(this.registeredListeners).forEach(([type, listeners]) => {
            const match = listeners?.findIndex((entry: Listener<any>) => entry.symbol === listenerSymbol);

            if (match != null && match >= 0) {
                listeners?.splice(match, 1);
            }
            if (match != null && listeners?.length === 0) {
                delete this.registeredListeners[type as InteractionTypes];
            }
        });
    }

    public destroy() {
        for (const type of EVENT_HANDLERS) {
            this.element.removeEventListener(type, this.eventHandler);
        }
    }

    private processEvent(event: MouseEvent | TouchEvent | Event) {
        let types: InteractionTypes[] = [];
        switch (event.type) {
            case 'click':
                types = ['click'];
                break;

            case 'mousedown':
                types = ['drag-start'];
                this.mouseDown = true;
                break;
            case 'touchstart':
                types = ['drag-start'];
                this.touchDown = true;
                break;

            case 'touchmove':
            case 'mousemove':
                types = this.mouseDown || this.touchDown ? ['drag'] : ['hover'];
                break;

            case 'mouseup':
                types = ['drag-end'];
                this.mouseDown = false;
                break;
            case 'touchend':
                types = ['drag-end', 'click'];
                this.touchDown = false;
                break;

            case 'mouseout':
            case 'touchcancel':
                types = ['leave'];
                break;
        }

        let coordSource;
        if (event instanceof MouseEvent) {
            const mouseEvent = event as MouseEvent;
            const { clientX, clientY, pageX, pageY, offsetX, offsetY } = mouseEvent;
            coordSource = { clientX, clientY, pageX, pageY, offsetX, offsetY };
        } else if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
            const touchEvent = event as TouchEvent;
            const lastTouch = touchEvent.touches[0] ?? touchEvent.changedTouches[0];
            const { clientX, clientY, pageX, pageY } = lastTouch;
            coordSource = { clientX, clientY, pageX, pageY };
        } else {
            // Unsupported event - abort.
            return;
        }

        for (const type of types) {
            const interactionType = type as InteractionTypes;
            const listeners = this.registeredListeners[interactionType] ?? [];
            const interactionEvent = this.buildEvent({ event, ...coordSource, type: interactionType });

            listeners.forEach((listener: Listener<any>) => {
                try {
                    listener.handler(interactionEvent);
                } catch (e) {
                    console.error(e);
                }
            });
        }
    }

    private buildEvent(opts: {
        type: InteractionTypes;
        event: Event;
        clientX: number;
        clientY: number;
        offsetX?: number;
        offsetY?: number;
        pageX?: number;
        pageY?: number;
    }) {
        let { type, event, clientX, clientY, offsetX, offsetY, pageX, pageY } = opts;

        if (offsetX == null || offsetY == null) {
            const rect = this.element.getBoundingClientRect();
            offsetX = clientX - rect.left;
            offsetY = clientY - rect.top;
        }
        if (pageX == null || pageY == null) {
            const pageRect = this.rootElement.getBoundingClientRect();
            pageX = clientX - pageRect.left;
            pageY = clientY - pageRect.top;
        }

        return {
            type,
            offsetX,
            offsetY,
            pageX,
            pageY,
            sourceEvent: event,
        };
    }
}
