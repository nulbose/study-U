import OpenAI from 'openai';
import { NextRequest } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { context, pdfText } = await request.json();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '너는 학습 플래시카드를 만드는 AI야. 반드시 JSON 형식으로만 응답해. 다른 텍스트는 절대 포함하지 마.',
        },
        {
          role: 'user',
          content: `
다음 내용을 바탕으로 플래시카드 10개를 만들어줘.
반드시 아래 JSON 형식으로만 응답해.

[
  {
    "front": "앞면 질문",
    "back": "뒷면 답변",
    "category": "카테고리"
  }
]

내용: ${pdfText ? pdfText.slice(0, 6000) : context}
          `,
        },
      ],
    });

    const text = completion.choices[0].message.content!;
    const clean = text.replace(/\`\`\`json|\`\`\`/g, '').trim();
    const flashcards = JSON.parse(clean);

    return Response.json({ flashcards });
  } catch (err) {
    console.error('플래시카드 오류:', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}