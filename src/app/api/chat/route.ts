import OpenAI from 'openai';
import { NextRequest } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { message, context, pdfText, history } = await request.json();

    // 문서가 여러 개인 경우 '---' 구분자로 분리. 총 컨텍스트 예산(24000자)을 문서 수만큼 균등 배분
    const buildDocText = (raw: string) => {
      const docs = raw.split('\n\n---\n\n');
      const perDocLimit = Math.max(2000, Math.floor(24000 / docs.length));
      return docs
        .map((doc, i) => `[문서 ${i + 1}]\n${doc.slice(0, perDocLimit)}`)
        .join('\n\n---\n\n');
    };

    const docCount = pdfText ? pdfText.split('\n\n---\n\n').length : 0;
    const docLabel = docCount > 1 ? `${docCount}개의 문서` : '문서';

    const systemPrompt = pdfText
      ? `너는 학습 도우미야. 아래 ${docLabel}(출처: ${context}) 내용을 바탕으로 질문에 답변해줘.
여러 문서가 있을 경우 각 문서의 내용을 모두 참고해서 답변해줘.
문서에 없는 내용은 "문서에서 찾을 수 없습니다"라고 말해줘.
항상 한국어로 답변해줘.

${buildDocText(pdfText)}`
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