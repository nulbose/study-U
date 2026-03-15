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
          content: '너는 학습 보고서를 작성하는 AI야. 반드시 JSON 형식으로만 응답해.',
        },
        {
          role: 'user',
          content: `
다음 내용을 바탕으로 학습 보고서를 만들어줘.
반드시 아래 JSON 형식으로만 응답해.

{
  "title": "보고서 제목",
  "summary": "전체 요약 (3-4문장)",
  "sections": [
    {
      "heading": "섹션 제목",
      "content": "섹션 내용"
    }
  ],
  "keyPoints": ["핵심 포인트1", "핵심 포인트2", "핵심 포인트3"],
  "conclusion": "결론"
}

내용: ${pdfText ? pdfText.slice(0, 6000) : context}
          `,
        },
      ],
    });

    const text = completion.choices[0].message.content!;
    const clean = text.replace(/\`\`\`json|\`\`\`/g, '').trim();
    const report = JSON.parse(clean);

    return Response.json({ report });
  } catch (err) {
    console.error('보고서 오류:', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}