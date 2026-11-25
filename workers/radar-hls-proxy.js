export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");

    if (!targetUrl) {
      return new Response("Lütfen ?url= parametresi ile bir .m3u8 adresi girin.", { status: 400 });
    }

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
      "Access-Control-Max-Age": "86400",
      "Access-Control-Expose-Headers": "Content-Length, Content-Range",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // TRT gibi katı sunucular için gerekli başlıklar
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "/",
          "Referer": new URL(targetUrl).origin + "/",
        },
      });

      const contentType = response.headers.get("content-type") || "";
      
      // M3U8 listesi geliyorsa: içindeki segment URL'lerini de proxy'e yönlendir
      if (contentType.includes("mpegurl") || targetUrl.includes(".m3u8")) {
        let text = await response.text();
        let baseUrl = new URL(targetUrl);
        
        const lines = text.split('\n').map(line => {
          line = line.trim();
          if (line && !line.startsWith('#')) {
            let absoluteUrl = line;
            if (!line.startsWith('http')) {
               absoluteUrl = new URL(line, baseUrl).toString();
            }
            return url.origin + "/?url=" + encodeURIComponent(absoluteUrl);
          }
          return line;
        });
        
        const newHeaders = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([key, value]) => newHeaders.set(key, value));
        newHeaders.set("Content-Type", "application/vnd.apple.mpegurl");

        return new Response(lines.join('\n'), { headers: newHeaders });
      }

      // Ses parçaları (segmentler) geldiyse: doğrudan oynatıcıya gönder
      const newResponse = new Response(response.body, response);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        newResponse.headers.set(key, value);
      });

      return newResponse;
    } catch (err) {
      return new Response("Proxy hatası: " + err.message, { status: 500, headers: corsHeaders });
    }
  },
};