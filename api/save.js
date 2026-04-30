export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, data } = req.body;
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;

  if (!scriptUrl) {
    return res.status(500).json({ error: 'Google Script URL not configured' });
  }

  try {
    // Google Apps Script는 POST 시 리다이렉트가 발생함
    // fetch는 기본적으로 POST 리다이렉트를 따라가지 않으므로
    // 데이터를 URL 파라미터로도 함께 전송
    const body = JSON.stringify({ type, data });

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain', // Google Apps Script는 text/plain을 더 잘 받음
      },
      body: body,
      redirect: 'follow'
    });

    // 응답이 JSON이 아닐 수도 있으므로 텍스트로 먼저 읽음
    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = { raw: text };
    }

    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('Save error:', error);
    return res.status(500).json({ error: '구글 드라이브 저장 실패: ' + error.message });
  }
}
