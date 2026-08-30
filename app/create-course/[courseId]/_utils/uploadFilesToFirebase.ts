import { CourseType } from "@/types/types";

export const uploadFilesToFirebase = async (
  _file: Blob,
  courseInfo: CourseType
) => {
  console.warn(
    "Firebase upload is disabled. Using the default banner for course:",
    courseInfo?.courseId
  );

  return null;
};
