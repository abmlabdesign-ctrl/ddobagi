/**
 * Streak, weekly goal and practice time, worked out from the lessons the
 * learner actually finished — never stored as running totals, so a gap in
 * practice or a new week shows the moment the date changes, and nothing
 * can drift from the record it comes from.
 */

/** One finished roleplay or micro mission. */
export type Lesson = { at: number; minutes: number };

export type PracticeSummary = {
  /** Days in a row with a lesson, ending today — or yesterday, while today is still open. */
  streakDays: number;
  practicedToday: boolean;
  /** Lessons finished since Monday 00:00 of this week. */
  weekCompleted: number;
  practiceMinutes: number;
};

/** `2026-09-29` in local time. */
export const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** Monday 00:00 of the week `date` falls in, local time. */
export function weekStart(date: Date) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

export function summarize(lessons: Lesson[], now: Date): PracticeSummary {
  const days = new Set(lessons.map((lesson) => dayKey(new Date(lesson.at))));
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const practicedToday = days.has(dayKey(cursor));
  // Today not done yet doesn't break the streak; a missed yesterday does.
  if (!practicedToday) cursor.setDate(cursor.getDate() - 1);
  let streakDays = 0;
  while (days.has(dayKey(cursor))) {
    streakDays += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const since = weekStart(now).getTime();
  return {
    streakDays,
    practicedToday,
    weekCompleted: lessons.filter((lesson) => lesson.at >= since).length,
    practiceMinutes: lessons.reduce((sum, lesson) => sum + lesson.minutes, 0),
  };
}
