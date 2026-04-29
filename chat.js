const PASSAGE = `백신(Vaccine)

백신은 특정 질병에 대한 면역을 형성하거나 증진시키는 생물학적 제제(preparation)이다. 대부분의 백신은 예방용(prophylactic)으로, 자연적으로 발생하는 병원체에 의해 향후 감염이 일어났을 때 그 발생을 예방하거나 그 영향을 완화하는 것을 목적으로 한다. 독감 백신은 인플루엔자 바이러스로부터 보호하기 위해 매년 접종되는 예방용 백신의 대표적인 예이다. 그러나 백신은 이미 질병에 걸린 사람들의 고통을 완화하기 위한 치료적(therapeutic) 목적으로도 사용되어 왔다. 이러한 치료적 활용의 예로는 현재 다양한 유형의 암치료를 위해 개발되고 있는 백신들을 들 수 있다. 최근까지 대부분의 백신은 아동을 대상으로 개발·접종되어 왔으나, 치료용 백신의 개발로 인해 성인을 대상으로 하는 치료의 수가 증가하고 있다.

초기 백신은 아시아에서 기원한 접종법인 인두법(variolation)의 개념에서 영감을 받았다. 인두법은 약화된 형태의 질병을 흡입을 통해 의도적으로 감염시키는 기술이다. 일부 역사가들은 인두법에 대한 가장 이른 기록이 인도의 8세기 문헌인 니다나(Nidana)라고 주장한다. 그러나 인두법에 대한 최초의 명확한 기록은 1549년 중국의 완전(Wan Quan)이 저술한 두진심법(Douzhen Xinfa)에서 찾아볼 수 있다.

이후 수 세기에 걸쳐 백신은 현대적인 예방 방식으로 발전하였다. 백신은 면역 체계를 미리 준비시켜 이후 병원체가 침입했을 때 빠르게 대응할 수 있도록 돕는다.`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const recentMessages = messages.slice(-6);

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        input: [
          {
            role: "system",
            content: [
              {
                type: "text",
                text: `당신은 학습을 돕는 AI 튜터입니다. 아래 지문을 바탕으로 답하세요.

[지문]
${PASSAGE}`
              }
            ]
          },
          ...recentMessages.map(msg => ({
            role: msg.role,
            content: [
              {
                type: "text",
                text: msg.content
              }
            ]
          }))
        ],
        max_output_tokens: 500
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: data?.error?.message || 'OpenAI API error'
      });
    }

    const reply =
      data.output?.[0]?.content?.[0]?.text ||
      '응답을 가져올 수 없습니다.';

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
}
