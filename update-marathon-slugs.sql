ALTER TABLE "MarathonDailyContest" SET (schema_locked = false);
ALTER TABLE "MarathonWeeklyContest" SET (schema_locked = false);

ALTER TABLE "MarathonDailyContest" ADD COLUMN "slug" STRING;
ALTER TABLE "MarathonWeeklyContest" ADD COLUMN "slug" STRING;

ALTER TABLE "MarathonDailyContest" SET (schema_locked = true);
ALTER TABLE "MarathonWeeklyContest" SET (schema_locked = true);
