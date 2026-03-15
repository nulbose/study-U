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
          content: '너는 인포그래픽 데이터를 구성하는 AI야. 반드시 JSON 형식으로만 응답해.',
        },
        {
          role: 'user',
          content: `
다음 내용을 바탕으로 인포그래픽 구조를 만들어줘.
반드시 아래 JSON 형식으로만 응답해.

{
  "title": "인포그래픽 제목",
  "subtitle": "부제목",
  "stats": [
    { "label": "항목명", "value": "수치 또는 짧은 텍스트", "icon": "이모지" }
  ],
  "timeline": [
    { "step": 1, "title": "단계 제목", "desc": "설명" }
  ],
  "categories": [
    { "name": "카테고리명", "items": ["항목1", "항목2"], "color": "#hex색상" }
  ]
}

stats는 4개, timeline은 3-5개, categories는 2-4개 만들어줘.

내용: ${pdfText ? pdfText.slice(0, 6000) : context}
          `,
        },
      ],
    });

    const text = completion.choices[0].message.content!;
    const clean = text.replace(/\`\`\`json|\`\`\`/g, '').trim();
    const infographic = JSON.parse(clean);

    return Response.json({ infographic });
  } catch (err) {
    console.error('인포그래픽 오류:', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}