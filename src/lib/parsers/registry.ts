import {
  FormatParser,
  monthKeyFromFilename,
  monthKeyFromSheetName,
  RawRow,
} from './types'
import { groupASwedishLegend } from './group-a-swedish-legend'
import { groupBTriColumn } from './group-b-tri-column'

const PARSERS: FormatParser[] = [groupASwedishLegend, groupBTriColumn]

export type SheetParseResult =
  | {
      file: string
      sheet: string
      status: 'ok'
      parserSlug: string
      monthKey: string
      rows: RawRow[]
    }
  | {
      file: string
      sheet: string
      status: 'skipped'
      reason: string
    }

export function runParsersOnSheet(
  file: string,
  sheet: string,
  rows: string[][],
  monthKeyHint?: string,
): SheetParseResult {
  const monthKey =
    monthKeyHint ??
    monthKeyFromSheetName(sheet) ??
    monthKeyFromFilename(file)
  if (!monthKey) {
    return {
      file,
      sheet,
      status: 'skipped',
      reason: 'Could not detect month from sheet or filename',
    }
  }
  for (const parser of PARSERS) {
    if (parser.match(rows)) {
      const parsed = parser.parse(rows, { file, monthKey, sheet })
      return {
        file,
        sheet,
        status: 'ok',
        parserSlug: parser.slug,
        monthKey,
        rows: parsed.map((r) => ({
          ...r,
          source: { ...r.source, sheet },
        })),
      }
    }
  }
  return {
    file,
    sheet,
    status: 'skipped',
    reason: 'No parser matched the headers',
  }
}

// Legacy single-sheet entry: wraps the above for CSV files (one logical sheet).
export function runParsers(file: string, rows: string[][]): SheetParseResult {
  if (/TEMPLATE/i.test(file)) {
    return {
      file,
      sheet: 'csv',
      status: 'skipped',
      reason: 'Template file',
    }
  }
  const monthKey = monthKeyFromFilename(file)
  return runParsersOnSheet(file, monthKey ?? 'csv', rows, monthKey ?? undefined)
}
