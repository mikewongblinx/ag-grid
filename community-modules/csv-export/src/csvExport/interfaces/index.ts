import {
    Column,
    ColumnGroup,
    ColumnModel,
    GridOptionsService,
    GridOptionsWrapper,
    ProcessCellForExportParams,
    ProcessGroupHeaderForExportParams,
    ProcessHeaderForExportParams,
    ProcessRowGroupForExportParams,
    RowNode,
    ValueService
} from "@ag-grid-community/core";
import { GridSerializer } from "../gridSerializer";

export interface BaseCreatorBeans {
    gridSerializer: GridSerializer;
    gridOptionsWrapper: GridOptionsWrapper;
    gridOptionsService: GridOptionsService;
}

export interface RowAccumulator {
    onColumn(column: Column, index: number, node?: RowNode): void;
}

export interface RowSpanningAccumulator {
    onColumn(columnGroup: ColumnGroup, header: string, index: number, span: number, collapsibleGroupRanges: number[][]): void;
}

export interface GridSerializingParams {
    columnModel: ColumnModel;
    valueService: ValueService;
    gridOptionsWrapper: GridOptionsWrapper;
    gridOptionsService: GridOptionsService;
    processCellCallback?: (params: ProcessCellForExportParams) => string;
    processHeaderCallback?: (params: ProcessHeaderForExportParams) => string;
    processGroupHeaderCallback?: (params: ProcessGroupHeaderForExportParams) => string;
    processRowGroupCallback?: (params: ProcessRowGroupForExportParams) => string;
}

export interface CsvSerializingParams extends GridSerializingParams {
    suppressQuotes: boolean;
    columnSeparator: string;
}

export interface GridSerializingSession<T> {
    prepare(columnsToExport: Column[]): void;
    onNewHeaderGroupingRow(): RowSpanningAccumulator;
    onNewHeaderRow(): RowAccumulator;
    onNewBodyRow(): RowAccumulator;
    addCustomContent(customContent: T): void;

    /**
     * FINAL RESULT
     */
    parse(): string;
}