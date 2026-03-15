import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');

    if (isYoutube) {
      const videoId = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
      )?.[1];

      if (!videoId) {
        return Response.json({ error: '유효하지 않은 YouTube URL입니다.' }, { status: 400 });
      }

      // 1단계: 자막 시도
      try {
        const { YoutubeTranscript } = await import('youtube-transcript');
        const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
          lang: 'ko',
        }).catch(() => YoutubeTranscript.fetchTranscript(videoId));

        const text = transcript
          .map((t: { text: string }) => t.text)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (text.length > 50) {
          console.log('YouTube 자막 추출 완료, 길이:', text.length);
          return Response.json({ text, source: 'transcript' });
        }
      } catch {
        console.log('자막 없음 → YouTube Data API로 전환');
      }

      // 2단계: YouTube Data API
      const apiKey = process.env.YOUTUBE_API_KEY;
      if (!apiKey) {
        return Response.json({
          text: `YouTube 영상 URL: ${url}\nYOUTUBE_API_KEY가 설정되지 않았습니다.`,
        });
      }

      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,statistics`;
      const res = await fetch(apiUrl);
      const data = await res.json();

      if (!data.items || data.items.length === 0) {
        return Response.json({ error: '영상 정보를 가져올 수 없습니다.' }, { status: 404 });
      }

      const item = data.items[0];
      const snippet = item.snippet;
      const stats = item.statistics;

      const text = `
[YouTube 영상 정보]
제목: ${snippet.title}
채널: ${snippet.channelTitle}
업로드 날짜: ${snippet.publishedAt?.slice(0, 10)}
조회수: ${Number(stats?.viewCount || 0).toLocaleString()}회
좋아요: ${Number(stats?.likeCount || 0).toLocaleString()}개

[영상 설명]
${snippet.description || '설명 없음'}

[태그]
${snippet.tags?.join(', ') || '태그 없음'}
      `.trim();

      return Response.json({ text, source: 'youtube-api' });
    }

    // ── 일반 웹페이지 ──
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;

    // 네이버 블로그 특별 처리
    const isNaverBlog = fullUrl.includes('blog.naver.com');
    if (isNaverBlog) {
      const text = await fetchNaverBlog(fullUrl);
      return Response.json({ text });
    }

    // 일반 웹페이지
    const text = await fetchWebPage(fullUrl);
    return Response.json({ text });

  } catch (err) {
    console.error('URL 파싱 오류:', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

// ── 네이버 블로그 파싱 ──
async function fetchNaverBlog(url: string): Promise<string> {
  try {
    // 네이버 블로그 모바일 버전으로 변환 (크롤링 허용)
    const mobileUrl = url
      .replace('blog.naver.com', 'm.blog.naver.com')
      .replace('/PostView.naver', '/PostView.naver');

    const res = await fetch(mobileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9',
        'Referer': 'https://m.blog.naver.com',
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // 네이버 블로그 본문 추출
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
    const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/);

    // 본문 영역 추출 (se-main-container 또는 postViewArea)
    let content = '';
    const mainMatch = html.match(/class="se-main-container"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/);
    const postMatch = html.match(/id="postViewArea"[^>]*>([\s\S]*?)<\/div>/);

    if (mainMatch) content = mainMatch[1];
    else if (postMatch) content = postMatch[1];
    else content = html;

    const text = content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#\d+;/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 10000);

    const title = titleMatch?.[1] || '네이버 블로그';
    const desc = descMatch?.[1] || '';

    return `[네이버 블로그]\n제목: ${title}\n요약: ${desc}\n\n본문:\n${text}`;
  } catch (err) {
    console.error('네이버 블로그 파싱 실패:', err);
    // 실패 시 일반 방식으로 재시도
    return fetchWebPage(url);
  }
}

// ── 일반 웹페이지 파싱 ──
async function fetchWebPage(url: string): Promise<string> {
  // 여러 User-Agent 시도
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Googlebot/2.1 (+http://www.google.com/bot.html)',
  ];

  let html = '';
  let lastError = '';

  for (const ua of userAgents) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': ua,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate',
          'Cache-Control': 'no-cache',
        },
      });

      if (res.ok) {
        html = await res.text();
        break;
      }
      lastError = `HTTP ${res.status}`;
    } catch (e) {
      lastError = String(e);
      continue;
    }
  }

  if (!html) {
    throw new Error(`페이지를 가져올 수 없습니다: ${lastError}`);
  }

  // OG 태그에서 제목/설명 추출
  const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
  const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
  const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/);

  const title = titleMatch?.[1] || titleTagMatch?.[1] || url;
  const desc = descMatch?.[1] || '';

  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 10000);

  return `[웹페이지]\n제목: ${title}\n요약: ${desc}\n\n본문:\n${text}`;
}