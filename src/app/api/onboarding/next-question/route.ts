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

This is question ${questionIndex + 1}. You may ask between 3 and 6 questions total.
Decide: do you have enough information to build a personalized plan, OR would one more question meaningfully improve it?

If you have enough info (at least 3 questions answered), return: { "done": true }
Otherwise, return the next question with 3–5 answer options. Don't repeat anything already asked.

Return ONLY valid JSON (no markdown):
Either { "done": true }
Or { "done": false, "text": "question text", "options": ["option 1", "option 2", "option 3", "option 4"] }`;

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
