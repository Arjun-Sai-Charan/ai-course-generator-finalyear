import { generateCourseChapters } from "@/configs/ai-models";
import { db } from "@/configs/db";
import { getYoutubeVideos } from "@/configs/service";
import { CourseChapters, CourseList } from "@/schema/schema";
import { CourseType } from "@/types/types";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const DEFAULT_VIDEO_ID = "dQw4w9WgXcQ";

function parseJsonResponse(value: string) {
  const cleaned = value
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(cleaned);
}

export async function POST(request: Request) {
  try {
    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId is required" },
        { status: 400 }
      );
    }

    const courses = await db
      .select()
      .from(CourseList)
      .where(eq(CourseList.courseId, courseId))
      .limit(1);

    const course = courses[0] as CourseType | undefined;

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    await db
      .delete(CourseChapters)
      .where(eq(CourseChapters.courseId, course.courseId));

    for (let index = 0; index < course.courseOutput.chapters.length; index++) {
      const chapter = course.courseOutput.chapters[index];
      const prompt = `Explain the concepts in detail on Topic: ${course.courseName}, Chapter: ${chapter.chapter_name}, in JSON Format with list of array with fields as Title, explanation of given chapter in detail, code examples (code field <precode> format) if applicable.`;

      let videoId = DEFAULT_VIDEO_ID;

      try {
        const videos = await getYoutubeVideos(
          `${course.courseName}: ${chapter.chapter_name}`
        );
        videoId = videos?.[0]?.id?.videoId || DEFAULT_VIDEO_ID;
      } catch (error) {
        console.error("YouTube lookup failed for chapter", index, error);
      }

      const result = await generateCourseChapters.sendMessage(prompt);
      const content = parseJsonResponse(result.response.text());

      await db.insert(CourseChapters).values({
        chapterId: index,
        courseId: course.courseId,
        content,
        videoId,
      });
    }

    await db
      .update(CourseList)
      .set({ isPublished: true })
      .where(
        and(eq(CourseList.courseId, course.courseId), eq(CourseList.id, course.id))
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to generate course content", error);

    return NextResponse.json(
      { error: "Failed to generate course content" },
      { status: 500 }
    );
  }
}
