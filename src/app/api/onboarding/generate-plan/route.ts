import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request: Request) {
  const { focus, goal, questionsAndAnswers, duration } = await request.json();

  const qaContext = (questionsAndAnswers as { question: string; answers: string[] }[])
    .map((qa, i) => `Q${i + 1}: ${qa.question}\nA: ${qa.answers.join(", ")}`)
    .join("\n\n");

  const prompt = `You are a compassionate wellness coach creating a personalized ${duration}-day plan.

Focus area: ${focus}
Goal: "${goal}"

What we know about this person:
${qaContext}

Create a ${duration}-day daily wellness plan tailored specifically to their answers. Structure it into 3 phases:
- Awareness (first third): building self-knowledge and insight
- Tools (middle third): learning and practising techniques
- Integration (final third): applying skills in real life

Each day should have 1–2 tasks. Task types: "breathing" | "journal" | "reflection" | "movement" | "mindfulness"

Also suggest 3 daily habits that fit this person's situation.

Return ONLY valid JSON (no markdown):
{
  "planName": "short personalized plan name",
  "summary": "2-sentence personalized summary of what this plan will do for them",
  "habits": [
    { "name": "habit name", "icon": "breath|heart|walk|wind|sun|moon|book|star", "frequency": "daily|weekdays" }
  ],
  "days": [
    {
      "day": 1,
      "theme": "day theme name",
      "phase": "Awareness",
      "tasks": [
        {
          "id": "d1-t1",
          "name": "task name",
          "type": "breathing",
          "duration": "5 min",
          "description": "one sentence description",
          "steps": ["step 1", "step 2", "step 3", "step 4"],
          "journalPrompts": ["prompt 1", "prompt 2"]
        }
      ]
    }
  ]
}

Only include journalPrompts for journal or reflection type tasks. Generate all ${duration} days.`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 16000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in response");
    const plan = JSON.parse(match[0]);
    return Response.json(plan);
  } catch (err) {
    console.error("generate-plan error:", err);
    return Response.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
