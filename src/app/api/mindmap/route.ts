import OpenAI from 'openai';
import { NextRequest } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { context } = await request.json();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `
다음 내용을 바탕으로 마인드맵 구조를 만들어줘.
반드시 아래 JSON 형식으로만 응답해. 다른 텍스트는 절대 포함하지 마.

{
  "center": "중심 주제",
  "branches": [
    {
      "label": "대분류1",
      "children": ["세부항목1", "세부항목2", "세부항목3"]
    }
  ]
}

branches는 4~6개, children은 각 2~4개로 만들어줘.

내용: ${context}
          `,
        },
      ],
    });

    const text = completion.choices[0].message.content!;
    const clean = text.replace(/\`\`\`json|\`\`\`/g, '').trim();
    const mindmap = JSON.parse(clean);

    return Response.json({ mindmap });
  } catch (err) {
    console.error('마인드맵 오류:', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}