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
          content: `너는 학습 퀴즈를 만드는 AI야.
반드시 아래 JSON 배열 형식으로만 응답해.
절대 다른 텍스트, 설명, 마크다운 코드블록을 포함하지 마.
오직 JSON 배열만 출력해.`,
        },
        {
          role: 'user',
          content: `다음 내용을 바탕으로 객관식 퀴즈 10문제를 만들어줘.

반드시 아래 형식의 JSON 배열만 출력해. 다른 텍스트는 절대 포함하지 마:
[
  {
    "question": "질문 내용",
    "options": ["보기1", "보기2", "보기3", "보기4"],
    "answer": 0,
    "explanation": "해설 내용"
  }
]

answer는 정답 보기의 인덱스(0~3)야.

학습 내용:
${content}`,
        },
      ],
      temperature: 0.7,
    });

    const raw = completion.choices[0].message.content ?? '';
    console.log('퀴즈 AI 응답:', raw.slice(0, 200));

    // JSON 추출 - 여러 방법으로 시도
    let quizzes = null;

    // 방법 1: 직접 파싱
    try {
      quizzes = JSON.parse(raw.trim());
    } catch {
      // 방법 2: 코드블록 제거 후 파싱
      try {
        const cleaned = raw
          .replace(/```json\s*/gi, '')
          .replace(/```\s*/gi, '')
          .trim();
        quizzes = JSON.parse(cleaned);
      } catch {
        // 방법 3: 배열 부분만 추출
        try {
          const match = raw.match(/\[[\s\S]*\]/);
          if (match) {
            quizzes = JSON.parse(match[0]);
          }
        } catch {
          console.error('JSON 파싱 실패:', raw);
        }
      }
    }

    if (!quizzes || !Array.isArray(quizzes) || quizzes.length === 0) {
      return Response.json(
        { error: '퀴즈 생성에 실패했습니다. 다시 시도해주세요.' },
        { status: 500 }
      );
    }

    // 데이터 검증 및 정제
    const validated = quizzes
      .filter((q) => q.question && Array.isArray(q.options) && q.options.length >= 2)
      .map((q) => ({
        question: String(q.question),
        options: q.options.slice(0, 4).map(String),
        answer: Number(q.answer) ?? 0,
        explanation: String(q.explanation ?? '해설이 없습니다.'),
      }));

    if (validated.length === 0) {
      return Response.json(
        { error: '유효한 퀴즈 데이터가 없습니다.' },
        { status: 500 }
      );
    }

    return Response.json({ quizzes: validated });

  } catch (err) {
    console.error('퀴즈 생성 오류:', err);
    return Response.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}