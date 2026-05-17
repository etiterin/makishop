export const VACATION_NOTICE_TEXT = 'Заказы, оформленные с 28 мая по 16 июня, будут отправлены после 17 июня.';

const VACATION_NOTICE_VISIBLE_FROM_TS = Date.parse('2026-05-17T00:00:00+03:00');
const VACATION_NOTICE_VISIBLE_UNTIL_TS = Date.parse('2026-06-17T00:00:00+03:00');

export function isVacationNoticeVisible(now: Date = new Date()): boolean {
  const timestamp = now.getTime();
  return timestamp >= VACATION_NOTICE_VISIBLE_FROM_TS && timestamp < VACATION_NOTICE_VISIBLE_UNTIL_TS;
}
