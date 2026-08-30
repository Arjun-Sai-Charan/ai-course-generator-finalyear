import { CourseType } from "@/types/types";

export const generateCourseContent = async (
  course: CourseType,
  setLoading: (loading: boolean) => void
) => {
  setLoading(true);

  try {
    const response = await fetch("/api/generate-course-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ courseId: course.courseId }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate course content");
    }
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    setLoading(false);
  }
};
