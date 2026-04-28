export function getMonthCells(baseDate: Date, checkedDates: string[]) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = firstDay.getDay();

  const doneSet = new Set(checkedDates);

  const cells: { day: number | null; done: boolean; isToday: boolean; isFuture: boolean; dateKey: string | null }[] = [];
  for (let i = 0; i < leading; i += 1) {
    cells.push({ day: null, done: false, isToday: false, isFuture: false, dateKey: null });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const d = new Date(year, month, day);
    const key = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const today = new Date();
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    cells.push({
      day,
      done: doneSet.has(key),
      isToday: d.toDateString() === today.toDateString(),
      isFuture: d.getTime() > endOfToday.getTime(),
      dateKey: key,
    });
  }

  return {
    monthLabel: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    cells,
  };
}
