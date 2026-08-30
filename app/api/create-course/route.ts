import { generateCourseLayout } from "@/configs/ai-models";
import { db } from "@/configs/db";
import { CourseList } from "@/schema/schema";
import { NextResponse } from "next/server";

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
    const { courseId, userInput, user } = await request.json();

    if (!courseId || !userInput?.topic) {
      return NextResponse.json(
        { error: "Missing course details" },
        { status: 400 }
      );
    }

    const prompt = `Generate a course tutorial on following details with field name, description, along with the chapter name about and duration: Category '${userInput?.category}' Topic '${userInput?.topic}' Description '${userInput?.description}' Level '${userInput?.difficulty}' Duration '${userInput?.duration}' chapters '${userInput?.totalChapters}' in JSON format.\n`;

    const result = await generateCourseLayout.sendMessage(prompt);
    const data = parseJsonResponse(result.response.text());

    await db.insert(CourseList).values({
      courseId,
      courseName: userInput.topic,
      category: userInput.category,
      level: userInput.difficulty,
      courseOutput: data,
      isVideo: userInput.video || "Yes",
      createdBy: user?.primaryEmailAddress?.emailAddress,
      username: user?.fullName,
      userprofileimage: user?.imageUrl,
    });

    return NextResponse.json({ success: true, courseId });
  } catch (error) {
    console.error("Failed to create course", error);

    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
