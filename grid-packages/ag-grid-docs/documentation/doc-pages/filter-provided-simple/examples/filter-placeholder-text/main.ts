import { Grid, GridOptions, IFilterPlaceholderFunctionParams } from '@ag-grid-community/core'

const columnDefs = [
  {
    field: 'athlete'
  },
  {
    field: 'country',
    filter: 'agTextColumnFilter',
    filterParams: {
      filterPlaceholder: 'Country...'
    }
  },
  {
    field: 'sport',
    filter: 'agTextColumnFilter',
    filterParams: {
      filterPlaceholder: (params: IFilterPlaceholderFunctionParams) => {
        const { filterOptionKey, placeholder } = params;
        return `${filterOptionKey} - ${placeholder}`;
      }
    },
  },
  {
    field: 'total',
    filter: 'agNumberColumnFilter',
    filterParams: {
      filterPlaceholder: (params: IFilterPlaceholderFunctionParams) => {
        const { filterOption } = params;
        return `${filterOption} total`;
      }
    }
  }
]

const gridOptions: GridOptions<IOlympicData> = {
  defaultColDef: {
    flex: 1,
    sortable: true,
    filter: true,
  },
  columnDefs: columnDefs,
  rowData: null,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data) => gridOptions.api!.setRowData(data))
})
