import { FormatParser, monthKeyFromFilename, RawRow } from './types'
import { groupASwedishLegend } from './group-a-swedish-legend'
import { groupBTriColumn } from './group-b-tri-column'

const PARSERS: FormatParser[] = [groupASwedishLegend, groupBTriColumn]

export type ParseResult =
  | { file: string; status: 'ok'; parserSlug: string; monthKey: string; rows: RawRow[] }
  | { file: string; status: 'skipped'; reason: string }

export function runParsers(
  file: string,
  rows: string[][],
): ParseResult {
  if (/TEMPLATE/i.test(file)) {
    return { file, status: 'skipped', reason: 'Template file' }
  }
  const monthKey = monthKeyFromFilename(file)
  if (!monthKey) {
    return {
      file,
      status: 'skipped',
      reason: 'Could not detect month from filename',
    }
  }
  for (const parser of PARSERS) {
    if (parser.match(rows)) {
      const parsed = parser.parse(rows, { file, monthKey })
      return {
        file,
        status: 'ok',
        parserSlug: parser.slug,
        monthKey,
        rows: parsed,
      }
    }
  }
  return { file, status: 'skipped', reason: 'No parser matched the headers' }
}
