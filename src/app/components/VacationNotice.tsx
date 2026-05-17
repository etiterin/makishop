import { AlertTriangle } from 'lucide-react';
import { VACATION_NOTICE_TEXT, isVacationNoticeVisible } from '../lib/storeAnnouncements';

type VacationNoticeProps = {
  text?: string;
  forceVisible?: boolean;
  className?: string;
};

export function VacationNotice({
  text = VACATION_NOTICE_TEXT,
  forceVisible = false,
  className = '',
}: VacationNoticeProps) {
  if (!forceVisible && !isVacationNoticeVisible()) {
    return null;
  }

  return (
    <div className={`rounded-3xl border border-amber-300/70 bg-amber-100/80 px-5 py-4 text-amber-950 shadow-sm backdrop-blur-sm ${className}`.trim()}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-200/90 text-amber-900">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-900/70">
            Важно
          </p>
          <p className="text-sm sm:text-base leading-relaxed">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}
