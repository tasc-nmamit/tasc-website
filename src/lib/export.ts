import Papa from "papaparse";
import * as XLSX from "xlsx";

/**
 * Downloads data as a CSV file.
 * @param data Array of objects representing rows.
 * @param filename Name of the file to save (without extension).
 */
export function downloadCSV(data: any[], filename: string) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Downloads data as an Excel file (.xlsx).
 * @param data Array of objects representing rows.
 * @param filename Name of the file to save (without extension).
 */
export function downloadExcel(data: any[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
