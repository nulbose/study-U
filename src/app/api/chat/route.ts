import OpenAI from 'openai';
import { NextRequest } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { message, context, pdfText, history } = await request.json();

    const systemPrompt = pdfText
      ? `너는 학습 도우미야. 아래 문서 내용을 바탕으로 질문에 답변해줘.
문서에 없는 내용은 "문서에서 찾을 수 없습니다"라고 말해줘.
항상 한국어로 답변해줘.

[문서 내용]
${pdfText.slice(0, 6000)}`
      : `너는 학습 도우미야. 다음 소스를 참고해서 답변해줘: ${context}
항상 한국어로 답변해줘.`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...(history || []),
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
    });

    return Response.json({
      response: completion.choices[0].message.content,
    });
  } catch (err) {
    console.error('채팅 오류:', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}