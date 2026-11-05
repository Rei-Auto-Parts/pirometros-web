import { TEXT_KEYS } from '../../../core/domain/constants/text-keys.constants';
import { t } from '../../../infra/tools/i18n.tool';
import { Button } from '../ui/button';

type PaginationProps = {
  page: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
};

export function Pagination({ page, total, pageSize, onChange }: PaginationProps) {
  const totalPages: number = Math.max(1, Math.ceil(total / pageSize));
  const label: string = `${t(TEXT_KEYS.pageLabel)} ${page} ${t(TEXT_KEYS.pageOf)} ${totalPages}`;

  return (
    <div className="flex items-center justify-between gap-4">
      <Button variant="outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        {t(TEXT_KEYS.previousPage)}
      </Button>
      <span>{label}</span>
      <Button variant="outline" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        {t(TEXT_KEYS.nextPage)}
      </Button>
    </div>
  );
}
