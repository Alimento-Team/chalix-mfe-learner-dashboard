import { StrictDict } from 'utils';
import { baseAppUrl } from 'data/services/lms/urls';
import { EXECUTIVE_EDUCATION_COURSE_MODES } from 'data/constants/course';

import * as module from './courseCard';
import * as simpleSelectors from './simpleSelectors';

const { cardSimpleSelectors, mkCardSelector } = simpleSelectors;

const today = new Date();
const dateSixMonthsFromNow = new Date();
dateSixMonthsFromNow.setDate(dateSixMonthsFromNow.getDate() + 180);

export const loadDateVal = (date) => (date ? new Date(date) : null);

export const courseCard = StrictDict({
  certificate: mkCardSelector(
    cardSimpleSelectors.certificate,
    (certificate) => (certificate === null ? {} : ({
      availableDate: new Date(certificate.availableDate),
      certPreviewUrl: baseAppUrl(certificate.certPreviewUrl),
      isDownloadable: certificate.isDownloadable,
      isEarnedButUnavailable: certificate.isEarned && new Date(certificate.availableDate) > new Date(),
      isRestricted: certificate.isRestricted,
      isEarned: certificate.isEarned,
    })),
  ),
  course: mkCardSelector(
    cardSimpleSelectors.course,
    (course) => {
      if (!course) {
        return { bannerImgSrc: '', courseNumber: '', courseName: '', socialShareUrl: '' };
      }
      return {
        bannerImgSrc: baseAppUrl(course.bannerImgSrc),
        courseNumber: course.courseNumber,
        courseName: course.courseName,
        socialShareUrl: course.socialShareUrl,
      };
    },
  ),
  courseProvider: mkCardSelector(
    cardSimpleSelectors.courseProvider,
    (courseProvider) => ({ name: courseProvider?.name }),
  ),
  courseRun: mkCardSelector(
    cardSimpleSelectors.courseRun,
    (courseRun) => (courseRun === null ? {} : {
      endDate: module.loadDateVal(courseRun.endDate),
      // The backend may return start date under different keys depending on the API
      // (startDate, start, effective_start, start_date). Prefer explicit startDate
      // then fall back to other common fields.
      startDate: module.loadDateVal(
        courseRun.startDate || courseRun.start || courseRun.effective_start || courseRun.start_date || null,
      ),
      advertisedStart: courseRun.advertisedStart,

      courseId: courseRun.courseId,
      isArchived: courseRun.isArchived,
      isStarted: courseRun.isStarted,

      minPassingGrade: courseRun.minPassingGrade ? Math.floor(courseRun.minPassingGrade * 100) : 0,

      homeUrl: courseRun.homeUrl,
      marketingUrl: courseRun.marketingUrl,

      progressUrl: baseAppUrl(courseRun.progressUrl),
      resumeUrl: baseAppUrl(courseRun.resumeUrl), // resume will route this to learning mfe.
      unenrollUrl: baseAppUrl(courseRun.unenrollUrl),
    }),
  ),
  credit: mkCardSelector(
    cardSimpleSelectors.credit,
    (credit) => {
      if (!credit || Object.keys(credit).length === 0) {
        return { isEligible: false };
      }
      return {
        isEligible: true,
        providerStatusUrl: credit.providerStatusUrl,
        providerName: credit.providerName,
        providerId: credit.providerId,
        error: credit.error,
        purchased: credit.purchased,
        requestStatus: credit.requestStatus,
      };
    },
  ),
  enrollment: mkCardSelector(
    cardSimpleSelectors.enrollment,
    (enrollment) => {
      if (enrollment == null) {
        return { isEnrolled: false };
      }
      // Handle cases where coursewareAccess is undefined (e.g., available but not enrolled courses)
      const coursewareAccess = enrollment.coursewareAccess || {};
      const { isStaff = false, hasUnmetPrereqs = false, isTooEarly = false } = coursewareAccess;
      return {
        coursewareAccess: enrollment.coursewareAccess,
        hasAccess: isStaff || !(hasUnmetPrereqs || isTooEarly),
        isEnrolled: enrollment.isEnrolled,
        lastEnrolled: enrollment.lastEnrolled,
        hasStarted: enrollment.hasStarted,

        accessExpirationDate: module.loadDateVal(enrollment.accessExpirationDate),
        canUpgrade: enrollment.canUpgrade,
        isAudit: enrollment.isAudit,
        isAuditAccessExpired: enrollment.isAuditAccessExpired,
        isVerified: enrollment.isVerified,

        isEmailEnabled: enrollment.isEmailEnabled,
        hasOptedOutOfEmail: enrollment.hasOptedOutOfEmail,
        mode: enrollment.mode,
        isExecEd2UCourse: EXECUTIVE_EDUCATION_COURSE_MODES.includes(enrollment.mode),
      };
    },
  ),
  entitlement: mkCardSelector(
    cardSimpleSelectors.entitlement,
    (entitlement) => {
      if (!entitlement || Object.keys(entitlement).length === 0) {
        return { isEntitlement: false };
      }
      const deadline = new Date(entitlement.changeDeadline);
      const deadlinePassed = deadline < today;
      const showExpirationWarning = (
        !entitlement.isFulfilled
        && !deadlinePassed
        && deadline <= dateSixMonthsFromNow
      );
      return {
        isEntitlement: true,

        availableSessions: entitlement.availableSessions,
        changeDeadline: deadline,
        isExpired: entitlement.isExpired,
        isFulfilled: entitlement.isFulfilled,
        uuid: entitlement.uuid,

        hasSessions: entitlement.availableSessions?.length > 0,
        canChange: !deadlinePassed,
        showExpirationWarning,
      };
    },
  ),
  gradeData: mkCardSelector(
    cardSimpleSelectors.gradeData,
    (gradeData) => ({ isPassing: gradeData?.isPassing || false }),
  ),
  relatedPrograms: mkCardSelector(
    cardSimpleSelectors.relatedPrograms,
    (relatedPrograms) => ({
      list: relatedPrograms.map(program => ({
        bannerImgSrc: program.bannerImgSrc,
        logoImgSrc: program.logoImgSrc,
        numberOfCourses: program.numberOfCourses,
        programType: program.programType,
        programUrl: program.programUrl,
        provider: program.provider,
        title: program.title,
      })),
      length: relatedPrograms.length,
    }),
  ),
});

export default courseCard;
