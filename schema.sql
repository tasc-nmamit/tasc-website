-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'OWNER');

-- CreateEnum
CREATE TYPE "CareerIntent" AS ENUM ('PLACEMENT', 'HIGHER_STUDIES', 'NO');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('SOLO', 'TEAM');

-- CreateEnum
CREATE TYPE "TeamStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "WinnerType" AS ENUM ('FIRST', 'SECOND', 'THIRD', 'PARTICIPATION');

-- CreateTable
CREATE TABLE "User" (
    "id" STRING NOT NULL,
    "name" STRING,
    "email" STRING NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" STRING,
    "bio" STRING,
    "phone" STRING,
    "username" STRING,
    "usn" STRING,
    "lightTheme" STRING,
    "darkTheme" STRING,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "displayName" STRING,
    "college" STRING DEFAULT 'N.M.A.M. Institute of Technology',
    "role" "Role" NOT NULL DEFAULT 'USER',
    "year" INT4,
    "branch" STRING,
    "isAiml" BOOL NOT NULL DEFAULT false,
    "isLateral" BOOL NOT NULL DEFAULT false,
    "onboardingComplete" BOOL NOT NULL DEFAULT false,
    "hackerrankUsername" STRING,
    "leetcodeProfile" STRING,
    "githubProfile" STRING,
    "skills" STRING[],
    "languages" STRING[],
    "careerIntent" "CareerIntent",
    "marathonStreak" INT4 NOT NULL DEFAULT 0,
    "marathonTotalScore" INT4 NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" STRING NOT NULL,
    "token" STRING NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" STRING NOT NULL,
    "type" STRING NOT NULL,
    "provider" STRING NOT NULL,
    "providerAccountId" STRING NOT NULL,
    "refresh_token" STRING,
    "access_token" STRING,
    "expires_at" INT4,
    "token_type" STRING,
    "scope" STRING,
    "id_token" STRING,
    "session_state" STRING,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Student" (
    "id" STRING NOT NULL,
    "image" STRING NOT NULL,
    "userId" STRING NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Core" (
    "id" STRING NOT NULL,
    "year" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "image" STRING NOT NULL,
    "order" INT4 NOT NULL,
    "post" STRING NOT NULL,
    "quote" STRING,

    CONSTRAINT "Core_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faculty" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "email" STRING NOT NULL,
    "designation" STRING NOT NULL,
    "image" STRING NOT NULL,
    "about" STRING[],
    "order" INT4 NOT NULL,
    "published" BOOL NOT NULL DEFAULT false,
    "designation2" STRING,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" STRING NOT NULL,
    "title" STRING NOT NULL,
    "description" STRING,
    "image" STRING NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" STRING,
    "reportLink" STRING,
    "venue" STRING,
    "guests" STRING[],
    "published" BOOL NOT NULL DEFAULT false,
    "type" "EventType" NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "maxTeamSize" INT4 NOT NULL DEFAULT 1,
    "minTeamSize" INT4 NOT NULL DEFAULT 1,
    "brief" STRING,
    "entryFee" STRING,
    "qr" STRING,
    "registrationsAvailable" BOOL NOT NULL DEFAULT true,
    "endDate" TIMESTAMP(3),
    "maxTeams" INT4,
    "notification" STRING,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventCustomField" (
    "id" STRING NOT NULL,
    "eventId" STRING NOT NULL,
    "label" STRING NOT NULL,
    "fieldType" STRING NOT NULL DEFAULT 'TEXT',
    "isRequired" BOOL NOT NULL DEFAULT false,
    "options" JSONB,
    "order" INT4 NOT NULL DEFAULT 0,

    CONSTRAINT "EventCustomField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Links" (
    "id" STRING NOT NULL,
    "instagram" STRING,
    "linkedin" STRING,
    "github" STRING,
    "userId" STRING NOT NULL,
    "twitter" STRING,
    "order" STRING[],
    "custom" JSONB,

    CONSTRAINT "Links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" STRING NOT NULL,
    "attended" BOOL NOT NULL DEFAULT false,
    "eventId" STRING NOT NULL,
    "name" STRING,
    "leaderId" STRING,
    "transactionId" STRING,
    "isConfirmed" BOOL NOT NULL DEFAULT false,
    "teamCode" STRING,
    "status" "TeamStatus" NOT NULL DEFAULT 'PENDING',
    "customFieldResponses" JSONB,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRegistration" (
    "id" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "teamId" STRING NOT NULL,
    "customFieldResponses" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Form" (
    "id" STRING NOT NULL,
    "title" STRING NOT NULL,
    "description" STRING,
    "published" BOOL NOT NULL DEFAULT false,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "requireAiml" BOOL NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormField" (
    "id" STRING NOT NULL,
    "formId" STRING NOT NULL,
    "label" STRING NOT NULL,
    "type" STRING NOT NULL DEFAULT 'TEXT',
    "options" JSONB,
    "isRequired" BOOL NOT NULL DEFAULT false,
    "order" INT4 NOT NULL DEFAULT 0,

    CONSTRAINT "FormField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormResponse" (
    "id" STRING NOT NULL,
    "formId" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "answers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" STRING NOT NULL,
    "title" STRING NOT NULL,
    "content" STRING NOT NULL,
    "published" BOOL NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" STRING NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarathonProblem" (
    "id" STRING NOT NULL,
    "dayNumber" INT4 NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" STRING NOT NULL,
    "description" STRING,
    "link" STRING NOT NULL,

    CONSTRAINT "MarathonProblem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarathonScore" (
    "id" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "problemId" STRING NOT NULL,
    "score" INT4 NOT NULL DEFAULT 0,
    "completed" BOOL NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarathonScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Winners" (
    "id" STRING NOT NULL,
    "teamId" STRING NOT NULL,
    "eventId" STRING NOT NULL,
    "position" "WinnerType" NOT NULL,

    CONSTRAINT "Winners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Placement" (
    "id" STRING NOT NULL,
    "yearId" STRING NOT NULL,
    "studentId" STRING NOT NULL,

    CONSTRAINT "Placement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" STRING NOT NULL,
    "companyName" STRING NOT NULL,
    "image" STRING NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" STRING NOT NULL,
    "companyId" STRING NOT NULL,
    "package" STRING NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Year" (
    "id" STRING NOT NULL,
    "year" STRING NOT NULL,
    "companies" STRING[],

    CONSTRAINT "Year_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patents" (
    "id" STRING NOT NULL,
    "patentId" STRING NOT NULL,
    "year" STRING NOT NULL,
    "title" STRING NOT NULL,
    "authors" STRING[],
    "inventorsName" STRING[],
    "inventorsAddress" STRING[],
    "certificate" STRING,

    CONSTRAINT "Patents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publication" (
    "id" STRING NOT NULL,
    "authors" STRING[],
    "title" STRING NOT NULL,
    "publish_date" STRING NOT NULL,
    "publisher" STRING,
    "journal" STRING,
    "conference" STRING,
    "link" STRING NOT NULL,
    "ranking" STRING,
    "impact_factor" STRING,
    "indexed" STRING NOT NULL,
    "publisher_conference" STRING,
    "year" INT4 NOT NULL,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FacultyPatents" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateTable
CREATE TABLE "_FacultyPublications" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateTable
CREATE TABLE "_EventToUser" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateTable
CREATE TABLE "_OfferToPlacement" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateTable
CREATE TABLE "_StudentPatents" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_order_key" ON "Faculty"("order");

-- CreateIndex
CREATE INDEX "name_index" ON "Faculty"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Links_userId_key" ON "Links"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_teamCode_key" ON "Team"("teamCode");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_userId_teamId_key" ON "EventRegistration"("userId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "FormResponse_formId_userId_key" ON "FormResponse"("formId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "MarathonProblem_dayNumber_key" ON "MarathonProblem"("dayNumber");

-- CreateIndex
CREATE UNIQUE INDEX "MarathonScore_userId_problemId_key" ON "MarathonScore"("userId", "problemId");

-- CreateIndex
CREATE UNIQUE INDEX "Winners_teamId_key" ON "Winners"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Placement_studentId_key" ON "Placement"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "_FacultyPatents_AB_unique" ON "_FacultyPatents"("A", "B");

-- CreateIndex
CREATE INDEX "_FacultyPatents_B_index" ON "_FacultyPatents"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FacultyPublications_AB_unique" ON "_FacultyPublications"("A", "B");

-- CreateIndex
CREATE INDEX "_FacultyPublications_B_index" ON "_FacultyPublications"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EventToUser_AB_unique" ON "_EventToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_EventToUser_B_index" ON "_EventToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OfferToPlacement_AB_unique" ON "_OfferToPlacement"("A", "B");

-- CreateIndex
CREATE INDEX "_OfferToPlacement_B_index" ON "_OfferToPlacement"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_StudentPatents_AB_unique" ON "_StudentPatents"("A", "B");

-- CreateIndex
CREATE INDEX "_StudentPatents_B_index" ON "_StudentPatents"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Core" ADD CONSTRAINT "Core_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCustomField" ADD CONSTRAINT "EventCustomField_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Links" ADD CONSTRAINT "Links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormField" ADD CONSTRAINT "FormField_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarathonScore" ADD CONSTRAINT "MarathonScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarathonScore" ADD CONSTRAINT "MarathonScore_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "MarathonProblem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Winners" ADD CONSTRAINT "Winners_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Winners" ADD CONSTRAINT "Winners_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_yearId_fkey" FOREIGN KEY ("yearId") REFERENCES "Year"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FacultyPatents" ADD CONSTRAINT "_FacultyPatents_A_fkey" FOREIGN KEY ("A") REFERENCES "Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FacultyPatents" ADD CONSTRAINT "_FacultyPatents_B_fkey" FOREIGN KEY ("B") REFERENCES "Patents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FacultyPublications" ADD CONSTRAINT "_FacultyPublications_A_fkey" FOREIGN KEY ("A") REFERENCES "Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FacultyPublications" ADD CONSTRAINT "_FacultyPublications_B_fkey" FOREIGN KEY ("B") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToUser" ADD CONSTRAINT "_EventToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToUser" ADD CONSTRAINT "_EventToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OfferToPlacement" ADD CONSTRAINT "_OfferToPlacement_A_fkey" FOREIGN KEY ("A") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OfferToPlacement" ADD CONSTRAINT "_OfferToPlacement_B_fkey" FOREIGN KEY ("B") REFERENCES "Placement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentPatents" ADD CONSTRAINT "_StudentPatents_A_fkey" FOREIGN KEY ("A") REFERENCES "Patents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentPatents" ADD CONSTRAINT "_StudentPatents_B_fkey" FOREIGN KEY ("B") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

