DROP TABLE IF EXISTS "MarathonScore";
DROP TABLE IF EXISTS "MarathonProblem";

CREATE TABLE "MarathonDailyContest" (
    "id" STRING NOT NULL,
    "dayNumber" INT4 NOT NULL,
    "targetYear" INT4 NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" STRING NOT NULL,
    "description" STRING,
    "link" STRING NOT NULL,
    "isConfirmed" BOOL NOT NULL DEFAULT false,

    CONSTRAINT "MarathonDailyContest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarathonDailyScore" (
    "id" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "contestId" STRING NOT NULL,
    "score" INT4 NOT NULL DEFAULT 0,
    "completed" BOOL NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarathonDailyScore_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MarathonDailyContest_dayNumber_targetYear_key" ON "MarathonDailyContest"("dayNumber", "targetYear");
CREATE UNIQUE INDEX "MarathonDailyScore_userId_contestId_key" ON "MarathonDailyScore"("userId", "contestId");

ALTER TABLE "MarathonDailyScore" ADD CONSTRAINT "MarathonDailyScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarathonDailyScore" ADD CONSTRAINT "MarathonDailyScore_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "MarathonDailyContest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
