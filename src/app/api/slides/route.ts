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
          content: '너는 프레젠테이션 슬라이드를 만드는 AI야. 반드시 JSON 형식으로만 응답해.',
        },
        {
          role: 'user',
          content: `
다음 내용을 바탕으로 슬라이드 자료를 만들어줘.
반드시 아래 JSON 형식으로만 응답해.

{
  "title": "프레젠테이션 제목",
  "slides": [
    {
      "type": "title",
      "title": "슬라이드 제목",
      "subtitle": "부제목",
      "content": []
    },
    {
      "type": "content",
      "title": "슬라이드 제목",
      "subtitle": "",
      "content": ["내용1", "내용2", "내용3"]
    }
  ]
}

type은 "title", "content", "summary" 중 하나야.
슬라이드는 6-8개 만들어줘.

내용: ${pdfText ? pdfText.slice(0, 6000) : context}
          `,
        },
      ],
    });

    const text = completion.choices[0].message.content!;
    const clean = text.replace(/\`\`\`json|\`\`\`/g, '').trim();
    const slides = JSON.parse(clean);

    return Response.json({ slides });
  } catch (err) {
    console.error('슬라이드 오류:', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}