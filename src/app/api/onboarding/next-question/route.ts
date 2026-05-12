import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request: Request) {
  const { focus, goal, questionIndex, previousQA } = await request.json();

  const prevContext = (previousQA as { question: string; answers: string[] }[])
    .map((qa, i) => `Q${i + 1}: ${qa.question}\nAnswers: ${qa.answers.join(", ")}`)
    .join("\n\n");

  const prompt = `You are personalizing a wellness onboarding flow.

Focus area: ${focus}
User's goal: "${goal}"
${prevContext ? `\nPrevious answers:\n${prevContext}` : ""}

Generate follow-up question ${questionIndex + 1} of 5. It should build naturally on what we already know about this person — don't ask anything they've already answered. Make the options feel specific and human, not clinical.

Return ONLY valid JSON (no markdown, no explanation):
{
  "text": "question text",
  "options": ["option 1", "option 2", "option 3", "option 4"]
}`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in response");
    return Response.json(JSON.parse(match[0]));
  } catch (err) {
    console.error("next-question error:", err);
    return Response.json({ error: "Failed to generate question" }, { status: 500 });
  }
}
