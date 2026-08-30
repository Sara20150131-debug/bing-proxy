export default {
  async fetch(request) {
    const url = new URL(request.url);
    const keyword = url.searchParams.get('q') || '人机恋';
    const target = `https://www.bing.com/search?q=${encodeURIComponent(keyword)}+site:xiaohongshu.com`;

    const response = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = await response.text();

    // 直接从 HTML 里提取标题
    const textMatches = html.match(/>([^<]{5,60})<\/[a-z]/gi) || [];
    const results = [];
    const blacklist = [
      'flights', 'Flight', '航班', '广告', 'Ad', 'Ads',
      '搜索', 'Bing', '隐私', '条款', '登录', '注册',
      '分享', '收藏', '评论', '举报', '反馈',
      'navigation', 'menu', 'footer', 'copyright', 'cookie',
      '跳转', '提示', '安全', '验证', '输入', '账号', '微软', '必应'
    ];

    for (const match of textMatches) {
      const text = match.replace(/[<>]/g, '').replace(/^[a-zA-Z]+\s*/, '').trim();
      const chineseCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
      if (text.length > 5 && text.length < 100 &&
          chineseCount >= 4 &&
          !blacklist.some(word => text.toLowerCase().includes(word.toLowerCase()))) {
        results.push(text);
      }
      if (results.length >= 3) break;
    }

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};