import { TEXT_KEYS, type TextKey } from '../../../core/domain/constants/text-keys.constants';
import type { PyrometerDto } from '../../../core/domain/dtos/pyrometer.dto';
import type { ReadingDto } from '../../../core/domain/dtos/reading.dto';
import { resolveName } from '../../../core/domain/models/pyrometer-name.model';
import { formatRegDate } from '../../../core/domain/models/reg-date.model';
import { t } from '../../../infra/tools/i18n.tool';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

const COLUMNS: readonly TextKey[] = [
  TEXT_KEYS.colDate,
  TEXT_KEYS.colPyrometer,
  TEXT_KEYS.colTemperature,
  TEXT_KEYS.colUnit,
  TEXT_KEYS.colBattery,
  TEXT_KEYS.colPlace,
];

type Nullable = string | number | null;

function orEmpty(value: Nullable): string {
  return value === null ? t(TEXT_KEYS.emptyValue) : String(value);
}

function rowCells(item: ReadingDto, pyrometers: readonly PyrometerDto[]): readonly string[] {
  return [
    item.measuredAt === null ? orEmpty(null) : formatRegDate(item.measuredAt),
    resolveName(pyrometers, item.pyrometerId, item.pyrometerName),
    item.temperature === null ? '' : String(item.temperature),
    orEmpty(item.unit),
    orEmpty(item.battery),
    orEmpty(item.place),
  ];
}

interface ReadingsTableProps {
  readonly items: readonly ReadingDto[];
  /** Da o nome mostrado (apelido); sem correspondencia, o nome do aparelho ou o serial. */
  readonly pyrometers?: readonly PyrometerDto[];
}

export function ReadingsTable({ items, pyrometers = [] }: ReadingsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {COLUMNS.map((column) => (
            <TableHead key={column}>{t(column)}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            {rowCells(item, pyrometers).map((cell, index) => (
              <TableCell key={COLUMNS[index]}>{cell}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
