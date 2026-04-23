const PASSAGE = `백신(Vaccine)

백신은 특정 질병에 대한 면역을 형성하거나 증진시키는 생물학적 제제(preparation)이다. 대부분의 백신은 예방용(prophylactic)으로, 자연적으로 발생하는 병원체에 의해 향후 감염이 일어났을 때 그 발생을 예방하거나 그 영향을 완화하는 것을 목적으로 한다. 독감 백신은 인플루엔자 바이러스로부터 보호하기 위해 매년 접종되는 예방용 백신의 대표적인 예이다. 그러나 백신은 이미 질병에 걸린 사람들의 고통을 완화하기 위한 치료적(therapeutic) 목적으로도 사용되어 왔다. 이러한 치료적 활용의 예로는 현재 다양한 유형의 암치료를 위해 개발되고 있는 백신들을 들 수 있다. 최근까지 대부분의 백신은 아동을 대상으로 개발·접종되어 왔으나, 치료용 백신의 개발로 인해 성인을 대상으로 하는 치료의 수가 증가하고 있다.

초기 백신은 아시아에서 기원한 접종법인 인두법(variolation)의 개념에서 영감을 받았다. 인두법은 약화된 형태의 질병을 흡입을 통해 의도적으로 감염시키는 기술이다. 일부 역사가들은 인두법에 대한 가장 이른 기록이 인도의 8세기 문헌인 니다나(Nidana)에서 주장한다. 그러나 인두법에 대한 최초의 명확한 기록은 1549년 중국의 완전(Wan Quan)이 저술한 두진심법(Douzhen Xinfa)에서 찾아볼 수 있다. 두진심법에는 건조된 천연두 딱지를 가루로 만들어 개인의 코 안으로 불어넣는 방식 서술되어 있으며, 이로 인해 감염된 사람은 경미한 형태의 천연두에 걸리게 되었다. 회복 후에는 해당 개인이 천연두에 대해 면역을 획득하였다. 인두법을 받은 사람들 중 일부는 사망하기도 했지만, 자연 감염으로 천연두에 걸렸을 때의 사망률에 비하면 그 비율은 훨씬 낮았다.

18세기에 이르러 인두법은 아프리카, 인도, 오스만 제국으로 확산되었다. 1717년, 오스만 제국 주재 영국 대사의 부인이었던 메리 몬터규(Lady Mary Montagu)는 콘스탄티노플에서 인두법을 접한 뒤, 영국으로 돌아가 이를 적극적으로 옹호하였다. 그럼에도 불구하고 인두법은 상당한 위험성을 동반하였다.

이후 수 세기에 걸쳐 에드워드 제너와 루이 파스퇴르와 같은 의학 연구자들은 고대의 인두법을 현대적인 백신 접종(inoculation) 방식으로 발전시켰다. 백신 접종은 예방 효과를 유지하면서도 위험성을 크게 낮추었다는 점에서 중요한 의학적 돌파구로 평가된다.

백신이 효과를 발휘하는 이유는 향후 접촉할 수 있는 병원체에 대비하여 면역 체계를 미리 준비시키기 때문이다. 백신이 투여되면 면역 체계는 백신 성분을 외부 침입자로 인식하고 이를 제거한 뒤, 해당 병원체를 기억한다.

일부 백신은 화학 물질이나 열을 사용하여 사멸 또는 불활성화된 병원성 미생물로 만들어진다. 백신은 단가 백신(monovalent) 또는 다가 백신(polyvalent)일 수 있다.

백신 개발의 한 가지 도전 과제는 경제적 문제이다. 많은 백신이 공중보건 측면에서 비용 대비 효과가 매우 높음에도 불구하고, 제약 회사나 생명공학 기업들은 수익성이 낮기 때문에 개발 동기가 부족하다.

전반적으로 백신의 발명은 특정 질병의 유병률을 현저히 감소시키는 데 기여하였다. 인구의 대다수가 백신을 접종할 경우 집단면역(herd immunity)이 형성된다.`;

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
        model: 'gpt-4o-mini',
        input: [
          {
            role: 'system',
            content: `당신은 학습을 돕는 AI 튜터입니다. 사용자는 아래 백신 지문을 학습하고 있습니다. 이 지문 내용을 바탕으로 한국어로 친절하고 명확하게 답해주세요. 지문에 근거한 답변을 우선하고, 답변은 너무 길지 않게 3~5문장 정도로 제시하세요. 지문에 없는 내용을 단정적으로 말하지 말고, 필요한 경우 "지문에 직접 제시되지는 않지만"이라고 밝혀 주세요.

[지문]
${PASSAGE}`
          },
          ...recentMessages
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: data?.error?.message || 'OpenAI API error'
      });
    }

    const reply =
     data.output?.[0]?.content?.[0]?.text || '응답을 가져올 수 없습니다.';

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
}
