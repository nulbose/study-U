import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { fileName } = await request.json();
    console.log('PDF 파싱 시작:', fileName);

    const { data, error } = await supabase.storage
      .from('sources')
      .download(fileName);

    if (error || !data) {
      console.error('다운로드 실패:', error);
      return Response.json({ error: '파일 다운로드 실패' }, { status: 500 });
    }

    console.log('다운로드 성공, 텍스트 추출 중...');

    const arrayBuffer = await data.arrayBuffer();

    const { extractText } = await import('unpdf');
    const { text } = await extractText(new Uint8Array(arrayBuffer), {
      mergePages: true,
    });

    console.log('텍스트 추출 완료, 길이:', text.length);

    return Response.json({ text });
  } catch (err) {
    console.error('PDF 파싱 오류:', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}