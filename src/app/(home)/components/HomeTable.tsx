"use client";

import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
  ValueGetterParams,
} from "ag-grid-community";
import { Home } from "@/types/home";
import { useMemo } from "react";

// Register AG Grid modules
// Assuming AG Grid Enterprise is available as per the task requirements
ModuleRegistry.registerModules([AllCommunityModule]);

interface HomeTableProps {
  homes: Home[]; // This is the filtered list of homes from page.tsx
}

export default function HomeTable({ homes }: HomeTableProps) {
  // Hardcoded values to simulate the missing columns in the wireframe
  const getMockData = (field: string, index: number) => {
    // This is for display purpose to match the look of the wireframe
    switch (field) {
      case "total_price":
        return `${(1000 + (index % 10) * 500).toLocaleString()} 000 kr`;
      case "property_type":
        return ["Enebolig", "Leilighet", "Rekkehus"][index % 3];
      case "ownership":
        return "Eier (Selveier)";
      case "rooms":
        return (index % 5) + 2; // 2 to 6 rooms
      case "suggestion":
        return `${(200 + (index % 10) * 10).toLocaleString()} 000 kr`;
      case "estimated_value":
        return `${(250 + (index % 10) * 15).toLocaleString()} 000 kr`;
      default:
        return "";
    }
  };

  const columnDefs: ColDef<Home>[] = useMemo(
    () => [
      {
        headerName: "", // Checkbox column (Wireframe shows a checkbox)
        checkboxSelection: true,
        headerCheckboxSelection: false,
        width: 50,
        suppressMenu: true,
        sortable: false,
        filter: false,
        resizable: false,
        lockPosition: true,
      },
      {
        headerName: "#",
        valueGetter: (params: ValueGetterParams<Home>) => {
          // ✅ FIX: Check if params.node exists AND rowIndex is defined
          if (
            !params.node ||
            params.node.rowIndex === null ||
            params.node.rowIndex === undefined
          ) {
            return null;
          }
          return params.node.rowIndex + 1;
        },
        width: 70,
        sortable: false,
        filter: false,
      },
      {
        field: "address",
        headerName: "Address",
        filter: true,
        sortable: true,
        flex: 1, // Takes up remaining space
        minWidth: 200,
      },
      // Mocked columns to match the wireframe:
      {
        headerName: "Total Price",
        valueGetter: (params: ValueGetterParams<Home>) => {
          if (!params.node) return "";
          return getMockData("total_price", params.node.rowIndex || 0);
        },
        width: 150,
        sortable: true,
        filter: false,
      },
      {
        headerName: "Property Type",
        valueGetter: (params: ValueGetterParams<Home>) => {
          if (!params.node) return "";
          return getMockData("property_type", params.node.rowIndex || 0);
        },
        width: 150,
        sortable: true,
        filter: true,
      },
      {
        headerName: "Ownership...",
        valueGetter: (params: ValueGetterParams<Home>) => {
          if (!params.node) return "";
          return getMockData("ownership", params.node.rowIndex || 0);
        },
        width: 150,
        sortable: true,
        filter: true,
      },
      {
        field: "bedrooms",
        headerName: "Bedr.",
        width: 100,
        filter: true,
        sortable: true,
      },
      {
        field: "construction_year",
        headerName: "Year Built",
        width: 120,
        filter: true,
        sortable: true,
      },
      {
        headerName: "Energy",
        valueGetter: (params: ValueGetterParams<Home>) => {
          if (!params.node) return "";
          return ["A", "B", "C", "G"][params.node.rowIndex || 0 % 4];
        },
        width: 100,
        sortable: true,
        filter: true,
      },
      {
        headerName: "Suggestion",
        valueGetter: (params: ValueGetterParams<Home>) => {
          if (!params.node) return "";
          return getMockData("suggestion", params.node.rowIndex || 0);
        },
        width: 150,
        sortable: true,
        filter: false,
      },
      {
        headerName: "Estimated V...",
        valueGetter: (params: ValueGetterParams<Home>) => {
          if (!params.node) return "";
          return getMockData("estimated_value", params.node.rowIndex || 0);
        },
        width: 150,
        sortable: true,
        filter: false,
      },
    ],
    []
  );

  const myTheme = themeQuartz.withParams({
    accentColor: "#2563eb",
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
    browserColorScheme: "light",
    headerBackgroundColor: "#f9fafb",
    headerFontSize: 14,
    headerFontWeight: 600,
  });

  return (
    <div className="ag-theme-quartz" style={{ width: "100%", height: "100%" }}>
      <AgGridReact<Home>
        theme={myTheme}
        rowData={homes}
        columnDefs={columnDefs}
        defaultColDef={{
          resizable: true,
          filter: true,
          sortable: true,
        }}
        rowSelection="multiple"
        suppressRowClickSelection={true}
        // Enable enterprise feature 'row grouping' if needed, as suggested by wireframe text 'Drag here to set row groups'
        // rowGroupPanelShow='always'
      />
    </div>
  );
}
