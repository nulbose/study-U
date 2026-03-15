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
          content: `너는 학습 오디오 스크립트를 작성하는 AI야.
반드시 아래 JSON 형식으로만 응답해. 다른 텍스트는 절대 포함하지 마.`,
        },
        {
          role: 'user',
          content: `다음 내용을 바탕으로 오디오 학습 스크립트를 만들어줘.
자연스럽게 말하듯이 써줘. 총 3~5분 분량으로.

반드시 아래 JSON 형식으로만 응답해:
{
  "title": "오디오 제목",
  "duration": "예상 재생 시간 (예: 3분 30초)",
  "sections": [
    {
      "title": "섹션 제목",
      "script": "이 섹션의 스크립트 내용. 자연스러운 대화체로."
    }
  ],
  "fullScript": "전체 스크립트를 하나로 합친 텍스트"
}

내용:
${content}`,
        },
      ],
      temperature: 0.7,
    });

    const raw = completion.choices[0].message.content ?? '';

    let audio = null;
    try {
      audio = JSON.parse(raw.trim());
    } catch {
      try {
        const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
        audio = JSON.parse(cleaned);
      } catch {
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) audio = JSON.parse(match[0]);
      }
    }

    if (!audio) {
      return Response.json({ error: '오디오 스크립트 생성 실패' }, { status: 500 });
    }

    return Response.json({ audio });
  } catch (err) {
    console.error('오디오 오류:', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}