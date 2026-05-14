const faqs = [
  {
    question: "宮崎SELENEとはどのようなチームですか？",
    answer:
      "宮崎SELENE（セレーネ）は、宮崎県宮崎市を拠点に活動する中学女子バスケットボールのクラブチームです。心身の健全な育成と、宮崎県クラブ選手権優勝・全国大会出場を目標に、日々練習に励んでいます。",
  },
  {
    question: "どこで練習・活動していますか？",
    answer:
      "宮崎市内の体育館を中心に練習・活動しています。練習試合や大会はおもに宮崎県内で行われています。最新の練習日程・お知らせは公式サイトのお知らせセクションでご確認ください。",
  },
  {
    question: "新メンバーの募集はしていますか？",
    answer:
      "本年度のクラブ生の募集は終了しました。次年度以降の募集については公式 Instagram（@2026.selene）でお知らせします。練習試合・合同練習・大会のお誘いなどのご相談は Instagram のDMよりお気軽にどうぞ。",
  },
  {
    question: "どんな大会に出場していますか？",
    answer:
      "宮崎県クラブ選手権・U15ジュニアウィンターカップ予選などの公式大会や、県内外チームとの練習試合に参加しています。最新の試合結果は「試合結果」セクションでご確認ください。",
  },
  {
    question: "セレーネ（SELENE）という名前の由来は？",
    answer:
      "SELENEはギリシャ神話の月の女神「セレーネ」に由来します。夜空に輝く月のように、宮崎のバスケ界を照らす存在を目指してチーム名に採用されました。",
  },
]

export function FaqSection() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="py-20 md:py-28"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-14">
          <span className="text-base md:text-lg font-semibold text-primary uppercase tracking-widest">
            FAQ
          </span>
          <h2
            id="faq-heading"
            className="text-3xl md:text-4xl font-black text-foreground mt-3 mb-4"
          >
            よくある質問
          </h2>
          <p className="text-muted-foreground text-base">
            宮崎SELENE（セレーネ）についてよくいただく質問をまとめました。
          </p>
        </div>

        <dl className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card px-6 py-5 space-y-2"
            >
              <dt className="font-bold text-foreground text-base md:text-lg leading-snug">
                <span className="text-primary mr-2" aria-hidden>Q.</span>
                {faq.question}
              </dt>
              <dd className="text-muted-foreground text-sm md:text-base leading-relaxed pl-6">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
