import { Column } from "../../entities/column";
import { BeanStub } from "../../context/beanStub";
import { Autowired, PostConstruct } from "../../context/context";
import { ColumnHoverService } from "../../rendering/columnHoverService";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";

export class HoverFeature extends BeanStub {

    @Autowired('columnHoverService') private columnHoverService: ColumnHoverService;

    private readonly columns: Column[];

    private element: HTMLElement;

    constructor(columns: Column[], element: HTMLElement) {
        super();
        this.columns = columns;
        this.element = element;
    }

    @PostConstruct
    private postConstruct(): void {
        if (this.gridOptionsService.is('columnHoverHighlight')) {
            this.addMouseHoverListeners();
        }
    }

    private addMouseHoverListeners(): void {
        this.addManagedListener(this.element, 'mouseout', this.onMouseOut.bind(this));
        this.addManagedListener(this.element, 'mouseover', this.onMouseOver.bind(this));
    }

    private onMouseOut(): void {
        this.columnHoverService.clearMouseOver();
    }

    private onMouseOver(): void {
        this.columnHoverService.setMouseOver(this.columns);
    }

}
