export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Invalid request' });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '당신은 학습을 돕는 AI 튜터입니다. 사용자가 백신에 관한 지문을 학습하고 있습니다. 질문에 친절하고 간결하게 한국어로 답해주세요. 답변은 지문 내용을 중심으로 하되 필요시 추가 설명을 해주세요.'
          },
          ...messages
        ],
        max_tokens: 1000
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const reply = data.choices?.[0]?.message?.content || '응답을 가져올 수 없습니다.';
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
}
