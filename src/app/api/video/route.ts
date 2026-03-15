import OpenAI from 'openai';
import { NextRequest } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { context, pdfText } = await request.json();

    const content = pdfText && pdfText.trim().length > 0
      ? pdfText.slice(0, 6000)
      : context;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `너는 학습 동영상 스크립트를 작성하는 AI야.
반드시 아래 JSON 형식으로만 응답해. 다른 텍스트는 절대 포함하지 마.`,
        },
        {
          role: 'user',
          content: `다음 내용을 바탕으로 학습 동영상 스크립트를 만들어줘.
각 장면마다 시각 자료 설명과 나레이션을 포함해줘.

반드시 아래 JSON 형식으로만 응답해:
{
  "title": "동영상 제목",
  "duration": "예상 재생 시간 (예: 5분)",
  "description": "동영상 전체 설명",
  "scenes": [
    {
      "index": 1,
      "title": "장면 제목",
      "duration": "장면 길이 (예: 30초)",
      "visual": "화면에 보여줄 시각 자료 설명",
      "narration": "이 장면의 나레이션 대본",
      "keyPoints": ["핵심 포인트1", "핵심 포인트2"]
    }
  ],
  "summary": "동영상 마무리 요약"
}

scenes는 5~7개 만들어줘.

내용:
${content}`,
        },
      ],
      temperature: 0.7,
    });

    const raw = completion.choices[0].message.content ?? '';

    let video = null;
    try {
      video = JSON.parse(raw.trim());
    } catch {
      try {
        const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
        video = JSON.parse(cleaned);
      } catch {
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) video = JSON.parse(match[0]);
      }
    }

    if (!video) {
      return Response.json({ error: '동영상 스크립트 생성 실패' }, { status: 500 });
    }

    return Response.json({ video });
  } catch (err) {
    console.error('동영상 오류:', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}