import { NextRequest, NextResponse } from "next/server";

// Dev: bypass SSL issues caused by VPN proxy
if (process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "0") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

// In-memory store for dev. Replace with DB later.
const analyses = new Map<string, object>();

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === "your-key-here") {
    return NextResponse.json(
      { error: "API key not configured. Add OPENROUTER_API_KEY to .env.local" },
      { status: 500 }
    );
  }

  const body = await request.json();
  const frames: string[] = body.frames;

  if (!frames || !Array.isArray(frames) || frames.length === 0) {
    return NextResponse.json(
      { error: "No frames provided" },
      { status: 400 }
    );
  }

  const prompt = `You are an expert tennis coach. You are given ${frames.length} key frames extracted from a video of someone playing tennis. The frames are in chronological order, covering the full swing motion from preparation to follow-through.

Analyze the tennis swing across ALL frames. Look at body positioning, racket angle, stance, weight transfer, and swing path.

If the frames cannot be analyzed (too dark, wrong angle, not tennis, multiple people, no person visible), return:
{ "error": "brief reason", "tip": "filming suggestion" }

Otherwise, return JSON:
{
  "swing_type": "forehand|backhand|serve|volley",
  "twinity_score": <0-100>,
  "feedback": [
    { "area": "Preparation|Backswing|Contact Point|Follow-through|Stance|Weight Transfer|Grip",
      "severity": "high|medium|low",
      "issue": "specific description of the problem",
      "fix": "specific actionable drill or correction"
    }
  ],
  "drills": ["drill 1 with specific steps", "drill 2 with specific steps"],
  "overall_assessment": "2-3 sentence summary with encouragement"
}

Be specific. Not "improve your footwork" but "step forward with your left foot 6 inches before contact".
Score calibration: beginners 30-50, intermediate 50-70, advanced 70-85, pro-level 85+.
Return ONLY valid JSON, no markdown.`;

  // Build content parts: prompt text + all frame images
  const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
    { type: "text", text: prompt },
  ];

  for (const frame of frames) {
    content.push({
      type: "image_url",
      image_url: { url: frame },
    });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://tennis-ai-coach.vercel.app",
        "X-Title": "AI Tennis Coach",
      },
      body: JSON.stringify({
        model: "qwen/qwen2.5-vl-72b-instruct",
        messages: [{ role: "user", content }],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter error:", response.status, errText);
      return NextResponse.json(
        { error: "Analysis failed. Please try again." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;

    if (!aiContent) {
      return NextResponse.json(
        { error: "Empty response from AI" },
        { status: 502 }
      );
    }

    // Parse JSON from response (handle markdown code blocks)
    let result;
    try {
      const jsonStr = aiContent.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      result = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", aiContent);
      return NextResponse.json(
        { error: "AI returned invalid format. Please try again." },
        { status: 502 }
      );
    }

    // Check for analysis error (bad video, etc.)
    if (result.error) {
      return NextResponse.json(result, { status: 200 });
    }

    // Store result with a random ID
    const id = crypto.randomUUID();
    analyses.set(id, result);

    // Auto-cleanup old entries (keep last 100)
    if (analyses.size > 100) {
      const firstKey = analyses.keys().next().value;
      if (firstKey) analyses.delete(firstKey);
    }

    return NextResponse.json({ id, ...result });
  } catch (err) {
    console.error("Analysis error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Network error: ${msg}` },
      { status: 500 }
    );
  }
}

// GET result by ID
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id || !analyses.has(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(analyses.get(id));
}
