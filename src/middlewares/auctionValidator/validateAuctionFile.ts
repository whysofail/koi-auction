import { Readable } from "stream";
import csvParser from "csv-parser";
import * as XLSX from "xlsx";
import { validateAuctionInput } from "./validateAuctionInput";
import Auction from "../../entities/Auction";

interface ValidationResult {
  validAuctions: Auction[];
  invalidRows: { row: number; issues: string[] }[];
  totalRows: number;
}

function cleanRowKeys<T extends Record<string, any>>(row: T): T {
  const cleanedRow: Record<string, any> = {};

  for (const key in row) {
    const cleanedKey = key.replace(/^\uFEFF/, ""); // Remove BOM if exists
    cleanedRow[cleanedKey] = row[key];
  }

  return cleanedRow as T;
}

export const validateAuctionFile = async (
  file: Express.Multer.File,
): Promise<ValidationResult> => {
  const validAuctions: Auction[] = [];
  const invalidRows: { row: number; issues: string[] }[] = [];

  const isCsv =
    file.mimetype === "text/csv" ||
    file.originalname.toLowerCase().endsWith(".csv");
  const isExcel =
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.originalname.toLowerCase().endsWith(".xlsx");

  let rowIndex = isCsv ? 2 : 2; // Start from 1 for CSV and 2 for Excel (header row)

  if (!isCsv && !isExcel) {
    throw new Error("Unsupported file type. Only CSV and XLSX are allowed.");
  }

  if (!file.buffer) {
    throw new Error("File buffer is missing.");
  }

  if (isCsv) {
    const stream = Readable.from(file.buffer).pipe(csvParser());

    for await (const row of stream) {
      const cleanedRow = cleanRowKeys(row);

      const { isValid, errors, auction } =
        await validateAuctionInput(cleanedRow);

      if (isValid && auction) {
        validAuctions.push(auction);
      } else {
        invalidRows.push({ row: rowIndex, issues: errors });
      }

      rowIndex++;
    }
  } else if (isExcel) {
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      defval: "",
    });

    for (const row of rows) {
      const cleanedRow = cleanRowKeys(row);

      const { isValid, errors, auction } =
        await validateAuctionInput(cleanedRow);

      if (isValid && auction) {
        validAuctions.push(auction);
      } else {
        invalidRows.push({ row: rowIndex, issues: errors });
      }

      rowIndex++;
    }
  }

  return {
    validAuctions,
    invalidRows,
    totalRows: rowIndex - 1,
  };
};
