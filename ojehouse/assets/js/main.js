(function(){
// ===== 설정: 일본 팝업 섹션 전체 on/off (일정이 하나도 없으면 false → 섹션·내비 자동 숨김) =====
var SHOW_JAPAN = true;

// ===== 일본 순회 팝업 도시 =====
// ▼▼▼ 일정 수정 위치 — 아래 배열만 고치면 카드가 그대로 반영됩니다 ▼▼▼
//   name   : 카드에 표시할 영문 도시명 (디스플레이 폰트 적용 · 모든 언어 공통)
//   key    : 아래 I18N 사전의 도시명 키 (영문명 밑에 언어별 표기로 표시)
//   date   : 확정 일정 문자열. 미확정이면 빈 문자열('') → "일정 조율 중"으로 표시
//   status : 'open' → RESERVATION OPEN / 'soon' → COMING SOON
//   show   : false 로 두면 해당 도시 카드만 숨김 (섹션 전체는 위의 SHOW_JAPAN 으로 제어)
// ※ 카드는 배열에 적은 순서대로 나옵니다 — 순회 날짜순으로 유지하세요.
// ※ 2026년 8·9월 출장은 4개 도시 모두 확정. 다음 출장에서 미정 도시가 생기면
//    date: '' / status: 'soon' 으로 두면 COMING SOON 카드로 표시됩니다.
var JAPAN_CITIES = [
  { name: 'Fukuoka', key: 'cityFukuoka', date: '2026.08.24 — 08.25', status: 'open', show: true },
  { name: 'Osaka',   key: 'cityOsaka',   date: '2026.08.26 — 08.27', status: 'open', show: true },
  { name: 'Nagoya',  key: 'cityNagoya',  date: '2026.09.13 — 09.15', status: 'open', show: true },
  { name: 'Tokyo',   key: 'cityTokyo',   date: '2026.09.16 — 09.18', status: 'open', show: true }
];
// ▲▲▲ 일정 수정 위치 ▲▲▲

// ===== 네이버 지도 설정 =====
// ▼▼▼ 지도 수정 위치 — 아래 값만 채우면 지도가 그대로 반영됩니다 ▼▼▼
//   keyId    : 네이버 클라우드 플랫폼 > Maps > 인증 정보의 Key.
//              콘솔 > Application 등록 시 사용 도메인(예: https://ojehouse.com)을 반드시 등록해야 합니다.
//              ※ 비워두면 지도 대신 주소 + 네이버 지도 링크(.map-fallback)가 표시됩니다.
//   keyParam : 발급 시점에 따라 키 파라미터 이름이 다릅니다.
//              최신 키 → 'ncpKeyId' / 예전에 발급받은 키 → 'ncpClientId'
//   lat/lng  : 스튜디오 좌표. 네이버 지도에서 해당 위치 우클릭 > '좌표 복사'로 확인할 수 있습니다.
//   placeUrl : '크게 보기' 링크 주소. 네이버플레이스 등록 후에는
//              https://map.naver.com/p/entry/place/{플레이스ID} 형태로 바꾸는 편이 정확합니다.
var NAVER_MAP = {
  keyId: '',
  keyParam: 'ncpKeyId',
  lat: 37.5665,
  lng: 126.9780,
  zoom: 16,
  title: '오제하우스',
  placeUrl: 'https://map.naver.com/p/search/' + encodeURIComponent('오제하우스')
};
// ▲▲▲ 지도 수정 위치 ▲▲▲

// ===== 다국어 사전 (기획서 08: 검수 번역문 전환 방식) =====
var I18N = {
  ko: {
    heroSub: '반영구 눈썹·입술 디자인이 완성될 때,<br>진짜 당신이 시작됩니다',
    cta: '예약 안내 보기',
    ctaChannel: '채널로 문의하기',
    introTitle: '균형있는 얼굴로의 안내',
    introCopy: '얼굴 구조와 피부 톤을 함께 읽는 1인 시술자의 프라이빗 반영구.<br>상담부터 시술 마무리까지 한 사람이 끝까지 책임집니다.',
    quote: '"눈썹 한 올의 방향과 입술의 경계선, 그 미세한 차이가 얼굴 전체의 인상을 바꿉니다."',
    f1k: '운영 형태', f1v: '1인 시술자 · 완전 예약제',
    f2k: '취급 시술', f2v: '눈썹 반영구, 입술 반영구',
    f3k: '운영 지역', f3v: '서울 매장, 일본 순회 팝업(후쿠오카·오사카·나고야·도쿄)',
    f4k: '상담 언어', f4v: '한국어 상담만 가능 · 사진/번역으로 진행 · 통역사 요청 가능',
    artistKo: '상담부터 시술 마무리까지, 한 사람이 직접 진행합니다',
    artistRole: '오제하우스 대표 · 반영구 아티스트',
    artistBio: '얼굴의 균형과 피부 톤을 먼저 읽고, 그 사람에게 어울리는 결과 색을 찾아갑니다. 유행하는 모양을 그대로 올리기보다 원래 그 자리에 있던 것처럼 보이는 눈썹과 입술을 지향합니다.<br><br>상담, 디자인, 시술, 마무리 안내까지 모든 과정을 직접 진행하기 때문에 하루에 받는 예약 수를 제한해 운영하고 있습니다.',
    svKo: '지역 물가를 반영해 국가·지역별 가격을 분리해 안내합니다',
    browKo: '눈썹 반영구', lipKo: '입술 반영구',
    darkLipTitle: '다크립 시술 안내',
    darkLipBody:
      '<p>다크립은 입술의 어두운 정도와 색소 반응에 따라 필요한 시술 횟수가 달라집니다.</p>' +
      '<p>다크립이 심하지 않은 경우 1회 시술만으로도 충분한 개선이 가능하지만, 어두운 정도가 심한 경우에는 1회만으로 완벽하게 개선하기 어렵습니다.</p>' +
      '<p>1회 시술 후 눈에 띄게 밝아질 수는 있으나, 개인에 따라 3~4회 이상 중화 시술이 필요할 수 있습니다.</p>' +
      '<p>따라서 완벽한 개선을 원하시는 분은 처음부터 여러 차례 방문이 필요할 수 있다는 점을 꼭 염두에 두고 예약해 주세요.</p>' +
      '<p>단 한 번의 시술로 완벽한 변화를 기대하기보다, 현재 입술보다 자연스럽고 건강해 보이는 정도의 개선을 원하시는 분이라면 언제든 환영합니다☺️</p>' +
      '<p class="notice-foot">※ 시술 횟수와 결과는 개인의 입술 상태, 색소 침착 정도, 피부 반응에 따라 달라질 수 있습니다.</p>',
    pfKo: '모델 공개 동의를 받은 사진만 게재합니다',
    pfNote: '얼굴형과 모류에 맞춘 결 표현으로, 화장하지 않아도 정돈된 인상을 만듭니다.',
    faqKicker: '자주 묻는 질문',
    q1: '시술 전 준비해야 할 것이 있나요?',
    a1: '시술 최소 3일 전부터 음주와 카페인 섭취를 줄여주시고, 눈썹·입술 부위의 각질 제거나 필링 시술은 2주 이상 간격을 두는 것을 권장합니다.',
    q2: '해외에서도 예약할 수 있나요?',
    a2: '네, 가능합니다. 다만 상담은 한국어로만 진행됩니다. 원하시는 스타일 사진과 번역 기능을 함께 활용하면 상담과 시술 진행에 대부분 문제가 없습니다. 소통이 많이 어려운 경우에는 예약일 4일 전까지 요청해 주시면 통역사를 준비해 드립니다(시간당 30,000원).',
    japanNote: '정확한 장소는 예약금 확인 후 안내드립니다.',
    cityFukuoka: '후쿠오카', cityOsaka: '오사카', cityNagoya: '나고야', cityTokyo: '도쿄',
    cityTba: '일정 조율 중',
    cityBtn: '문의하기',
    cityBtnSoon: '오픈 알림 문의',
    notice: '현재 온라인 예약 시스템은 준비 중입니다.<br><strong>아래 채널로 문의</strong>해 주시면 예약 가능한 일정과 예약금 안내를 도와드립니다.',
    s1: '원하는 시술과 희망 날짜를 정합니다.', s2: '편한 채널로 문의합니다.',
    s3: '시술 국가·지역과 가능한 일정을 안내받습니다.', s4: '계좌 또는 PayPal로 예약금을 입금합니다.',
    s5: '입금 확인 후 예약이 최종 확정됩니다.',
    locAddr: '주소', locAddrV: '서울특별시 (상세 주소 확정 예정)',
    locHours: '운영시간', locHoursV: '화–토 11:00–19:00 · 완전 예약제',
    locOff: '휴무', locOffV: '매주 일·월요일',
    locAsk: '문의', locAskV: '카카오채널 · 네이버플레이스',
    locMap: '네이버 지도에서 크게 보기 →',
    modalDesc: '현재 온라인 예약 시스템은 준비 중입니다.<br>편하신 채널로 문의해 주시면 일정과 예약금 안내를 도와드립니다.',
    modalSteps: '문의 → 일정 확인 → <strong>예약금 입금(계좌/PayPal)</strong> → 입금 확인 후 <strong>예약 확정</strong><br>시술 주의사항은 확정 시 함께 안내드립니다.',
    external: '채널 선택 시 외부 서비스로 이동합니다.',
    badge: '추천'
  },
  en: {
    heroSub: 'When your brow & lip design is complete,<br>the real you begins.',
    cta: 'Reservation Guide',
    ctaChannel: 'Contact via Channels',
    introTitle: 'A Guide to a Balanced Face',
    introCopy: 'Private permanent makeup by a single artist who reads your facial structure and skin tone.<br>One person takes care of everything, from the consultation to the final touch.',
    quote: '"The direction of a single brow hair, the border of the lips — these subtle differences change the entire impression."',
    f1k: 'Studio', f1v: 'Single artist · By appointment only',
    f2k: 'Services', f2v: 'Brow PMU, Lip PMU',
    f3k: 'Locations', f3v: 'Seoul studio, Japan pop-up tour (Fukuoka · Osaka · Nagoya · Tokyo)',
    f4k: 'Consultation', f4v: 'Korean only · Photos & translation apps · Interpreter available on request',
    artistKo: 'One artist handles everything, from the consultation to the final touch.',
    artistRole: 'Founder · Permanent Makeup Artist, OJEHOUSE',
    artistBio: 'Reading the balance of your face and your skin tone first, then finding the shape and colour that suit you. Rather than copying whatever shape is trending, the aim is brows and lips that look as if they were always there.<br><br>Consultation, design, the procedure and aftercare guidance are all handled personally, so the number of appointments taken per day is kept deliberately small.',
    svKo: 'Prices are listed separately by country and region.',
    browKo: 'Eyebrow Permanent Makeup', lipKo: 'Lip Permanent Makeup',
    darkLipTitle: 'Important Notice — Dark Lip Correction',
    darkLipBody:
      '<p>For dark lips, the number of sessions required varies with how dark the lips are and how the pigment responds.</p>' +
      '<p>If the darkness is mild, a single session can already bring a sufficient improvement. If it is severe, however, one session is unlikely to correct it completely.</p>' +
      '<p>Your lips may look noticeably brighter after one session, but depending on the individual, three to four or more neutralising sessions may be needed.</p>' +
      '<p>So if you are hoping for a full correction, please book with the understanding that several visits may be necessary from the very beginning.</p>' +
      '<p>Rather than expecting a perfect transformation from a single session, if you are looking for lips that simply look more natural and healthier than they do now, you are always welcome ☺️</p>' +
      '<p class="notice-foot">※ The number of sessions and the final result may vary with your lip condition, the degree of pigmentation and your skin response.</p>',
    pfKo: 'Only photos with model consent are posted.',
    pfNote: 'Hair-stroke work tailored to your face shape — a polished look, even without makeup.',
    faqKicker: 'Frequently Asked Questions',
    q1: 'How should I prepare before the procedure?',
    a1: 'Please avoid alcohol and caffeine for at least 3 days before your visit, and leave 2+ weeks after any exfoliation or peeling near the brow/lip area.',
    q2: 'Can I book from overseas?',
    a2: 'Yes. Please note that consultations are conducted in Korean only. With reference photos and a translation app, the consultation and the procedure itself go smoothly in almost every case. If communication is still difficult, let us know at least 4 days before your appointment and we will arrange an interpreter (KRW 30,000 per hour).',
    japanNote: 'The exact venue is shared after deposit confirmation.',
    // 영문에서는 카드 상단 영문 도시명과 겹치므로 비워 둔다 (.city-local:empty → 숨김)
    cityFukuoka: '', cityOsaka: '', cityNagoya: '', cityTokyo: '',
    cityTba: 'DATES TBA',
    cityBtn: 'Contact',
    cityBtnSoon: 'Notify me',
    notice: 'Online booking is coming soon.<br><strong>Contact us via the channels below</strong> for available dates and deposit guidance.',
    s1: 'Choose your service and preferred date.', s2: 'Reach out via your preferred channel.',
    s3: 'Receive available dates for your country/region.', s4: 'Pay the deposit via bank transfer or PayPal.',
    s5: 'Your reservation is confirmed once the deposit is verified.',
    locAddr: 'Address', locAddrV: 'Seoul, Korea (details TBA)',
    locHours: 'Hours', locHoursV: 'Tue–Sat 11:00–19:00 · By appointment',
    locOff: 'Closed', locOffV: 'Sunday & Monday',
    locAsk: 'Contact', locAskV: 'WhatsApp · Instagram',
    locMap: 'View larger map on Naver Map →',
    modalDesc: 'Online booking is coming soon.<br>Contact us via your preferred channel for dates and deposit guidance.',
    modalSteps: 'Inquiry → Date check → <strong>Deposit (bank/PayPal)</strong> → <strong>Confirmed</strong> after verification.<br>Aftercare instructions are shared upon confirmation.',
    external: 'Selecting a channel opens an external service.',
    badge: 'Recommended'
  },
  ja: {
    heroSub: '眉とリップのデザインが完成したとき、<br>本当のあなたが始まります。',
    cta: 'ご予約のご案内',
    ctaChannel: 'チャンネルで問い合わせ',
    introTitle: 'バランスのとれた顔立ちへ',
    introCopy: '顔の構造と肌のトーンを読み解く、1人の施術者によるプライベートアートメイク。<br>カウンセリングから仕上げまで、最後まで責任を持って担当します。',
    quote: '「眉一本の流れ、唇の輪郭線。その繊細な差が、顔全体の印象を変えます。」',
    f1k: '運営形態', f1v: '施術者1名 · 完全予約制',
    f2k: '施術内容', f2v: '眉アートメイク、リップアートメイク',
    f3k: 'エリア', f3v: 'ソウル店舗、日本巡回ポップアップ（福岡・大阪・名古屋・東京）',
    f4k: 'カウンセリング', f4v: '韓国語のみ · 写真と翻訳アプリで対応 · 通訳の手配可',
    artistKo: 'カウンセリングから仕上げまで、1人の施術者が直接担当します。',
    artistRole: 'オジェハウス代表 · アートメイクアーティスト',
    artistBio: '顔のバランスと肌のトーンをまず読み取り、その方に似合う形と色を探していきます。流行の形をそのまま乗せるのではなく、もとからそこにあったように見える眉とリップを目指しています。<br><br>カウンセリング・デザイン・施術・アフターケアのご案内まですべて自分で行うため、1日にお受けするご予約数を制限して運営しています。',
    svKo: '国・地域ごとに料金を分けてご案内しています。',
    browKo: '眉アートメイク', lipKo: 'リップアートメイク',
    darkLipTitle: 'ダークリップ施術のご案内',
    darkLipBody:
      '<p>ダークリップは、唇の黒ずみの程度と色素の反応によって必要な施術回数が異なります。</p>' +
      '<p>黒ずみが強くない場合は1回の施術でも十分な改善が期待できますが、程度が強い場合は1回で完全に改善することは難しくなります。</p>' +
      '<p>1回の施術でも目に見えて明るくなることはありますが、個人差により3〜4回以上の中和施術が必要になる場合があります。</p>' +
      '<p>そのため、完全な改善をご希望の方は、最初から複数回のご来店が必要になる可能性を必ずご了承のうえご予約ください。</p>' +
      '<p>一度の施術で完璧な変化を期待されるよりも、今の唇より自然で健康的に見える程度の改善をお望みの方は、いつでも歓迎いたします☺️</p>' +
      '<p class="notice-foot">※ 施術回数と仕上がりは、個人の唇の状態・色素沈着の程度・肌の反応によって異なります。</p>',
    pfKo: 'モデルの掲載同意を得た写真のみ掲載しています。',
    pfNote: '顔立ちと毛流れに合わせた毛並み表現で、すっぴんでも整った印象に。',
    faqKicker: 'よくあるご質問',
    q1: '施術前に準備することはありますか？',
    a1: '施術の3日前から飲酒・カフェインを控えていただき、眉・唇まわりの角質ケアやピーリングは2週間以上空けることをおすすめします。',
    q2: '海外からでも予約できますか？',
    a2: 'はい、可能です。ただし、カウンセリングは韓国語のみで行っております。ご希望のデザイン写真と翻訳アプリを併用すれば、カウンセリングも施術もほとんどの場合問題なく進められます。意思疎通が難しい場合は、ご予約日の4日前までにお申し付けいただければ通訳者を手配いたします（1時間あたり30,000ウォン）。',
    japanNote: '正確な場所は予約金確認後にご案内します。',
    cityFukuoka: '福岡', cityOsaka: '大阪', cityNagoya: '名古屋', cityTokyo: '東京',
    cityTba: '日程調整中',
    cityBtn: 'お問い合わせ',
    cityBtnSoon: '日程のお知らせ希望',
    notice: 'オンライン予約は現在準備中です。<br><strong>下記のチャンネルからお問い合わせ</strong>いただければ、空き日程と予約金をご案内します。',
    s1: 'ご希望の施術と日程をお決めください。', s2: 'ご都合の良いチャンネルからお問い合わせください。',
    s3: '施術地域と空き日程をご案内します。', s4: '銀行振込またはPayPalで予約金をお支払いください。',
    s5: 'ご入金確認後、予約が確定します。',
    locAddr: '住所', locAddrV: 'ソウル特別市（詳細は追ってご案内）',
    locHours: '営業時間', locHoursV: '火–土 11:00–19:00 · 完全予約制',
    locOff: '定休日', locOffV: '日曜・月曜',
    locAsk: 'お問い合わせ', locAskV: 'LINE · Instagram',
    locMap: 'NAVERマップで大きく見る →',
    modalDesc: 'オンライン予約は準備中です。<br>ご都合の良いチャンネルからお問い合わせください。',
    modalSteps: 'お問い合わせ → 日程確認 → <strong>予約金のお支払い（振込/PayPal）</strong> → 確認後<strong>予約確定</strong><br>施術の注意事項は確定時にご案内します。',
    external: 'チャンネル選択で外部サービスに移動します。',
    badge: 'おすすめ'
  },
  zh: {
    heroSub: '当眉唇设计完成之时，<br>真正的你由此开始。',
    cta: '预约指南',
    ctaChannel: '通过渠道咨询',
    introTitle: '通往均衡面容的指引',
    introCopy: '由一位技师亲自解读脸部结构与肤色的私人半永久定妆。<br>从咨询到收尾，全程由同一人负责到底。',
    quote: '"一根眉毛的走向、唇部的轮廓线，这些细微的差别足以改变整张脸的印象。"',
    f1k: '经营形式', f1v: '一人技师 · 完全预约制',
    f2k: '服务项目', f2v: '眉部半永久、唇部半永久',
    f3k: '服务地区', f3v: '首尔门店、日本巡回快闪（福冈·大阪·名古屋·东京）',
    f4k: '咨询语言', f4v: '仅限韩语 · 借助照片与翻译工具沟通 · 可申请翻译人员',
    artistKo: '从咨询到收尾，全程由同一位技师亲自完成。',
    artistRole: 'OJEHOUSE 主理人 · 半永久艺术师',
    artistBio: '先读懂脸部的平衡与肤色，再寻找适合本人的形状与颜色。比起照搬流行的眉型，更希望做出像本来就长在那里一样自然的眉毛与唇色。<br><br>咨询、设计、操作到术后说明都由本人亲自完成，因此每天接待的预约数量会有所限制。',
    svKo: '根据各国家/地区物价分别标示价格。',
    browKo: '眉部半永久', lipKo: '唇部半永久',
    darkLipTitle: '暗唇（黑唇）改善须知',
    darkLipBody:
      '<p>暗唇所需的操作次数，会因唇色暗沉的程度与色素反应的不同而有所差异。</p>' +
      '<p>若暗沉程度较轻，一次操作即可获得充分改善；但若暗沉较为严重，仅靠一次操作很难完全改善。</p>' +
      '<p>一次操作后唇色可能会明显提亮，但因人而异，可能需要3~4次以上的中和操作。</p>' +
      '<p>因此，希望达到完全改善的顾客，请在预约前充分了解：从一开始就可能需要多次到店。</p>' +
      '<p>与其期待一次操作就带来完美变化，如果您希望的是让嘴唇比现在更自然、更健康的改善效果，我们随时欢迎您☺️</p>' +
      '<p class="notice-foot">※ 操作次数与最终效果，会因个人唇部状态、色素沉着程度及皮肤反应而有所不同。</p>',
    pfKo: '仅展示已获得模特同意的照片。',
    pfNote: '依据脸型与毛流定制的线条表现，素颜也能拥有精致印象。',
    faqKicker: '常见问题',
    q1: '术前需要做什么准备？',
    a1: '术前至少3天请减少饮酒和咖啡因摄入；眉唇部位的去角质或焕肤护理请间隔2周以上。',
    q2: '在海外也可以预约吗？',
    a2: '可以。不过咨询仅以韩语进行。配合参考照片与翻译工具，咨询和操作在绝大多数情况下都能顺利进行。若沟通确实困难，请在预约日的4天前提出申请，我们可为您安排翻译人员（每小时30,000韩元）。',
    japanNote: '确切地点将在确认定金后告知。',
    cityFukuoka: '福冈', cityOsaka: '大阪', cityNagoya: '名古屋', cityTokyo: '东京',
    cityTba: '日程协调中',
    cityBtn: '咨询',
    cityBtnSoon: '日程开放通知',
    notice: '在线预约系统正在筹备中。<br>请<strong>通过以下渠道咨询</strong>，我们将为您安排可预约日期及定金事宜。',
    s1: '确定想要的项目和期望日期。', s2: '通过方便的渠道进行咨询。',
    s3: '获取所在国家/地区的可预约日程。', s4: '通过银行转账或PayPal支付定金。',
    s5: '确认到账后，预约正式确定。',
    locAddr: '地址', locAddrV: '首尔特别市（详细地址待定）',
    locHours: '营业时间', locHoursV: '周二–周六 11:00–19:00 · 完全预约制',
    locOff: '休息日', locOffV: '每周日、周一',
    locAsk: '咨询', locAskV: 'WeChat · Instagram',
    locMap: '在 NAVER 地图中查看 →',
    modalDesc: '在线预约系统正在筹备中。<br>请通过方便的渠道咨询，我们将为您安排日程与定金事宜。',
    modalSteps: '咨询 → 确认日程 → <strong>支付定金（转账/PayPal）</strong> → 确认后<strong>预约确定</strong><br>操作注意事项将在确定时一并告知。',
    external: '选择渠道后将跳转至外部服务。',
    badge: '推荐'
  }
};
// 기획서 04·08: 언어별 핵심 CTA 분기
var PRIMARY = { ko: 'naver', en: 'whatsapp', ja: 'line', zh: 'wechat' };
var LANG_CODE = { ko: 'ko', en: 'en', ja: 'ja', zh: 'zh-Hans' };

// 일본 팝업 도시 카드 생성 — 텍스트는 data-i18n 으로 표시해 언어 전환에 그대로 따라간다
function renderCities() {
  var grid = document.querySelector('[data-city-grid]');
  if (!grid) return;
  grid.innerHTML = JAPAN_CITIES.filter(function(c) { return c.show; }).map(function(c) {
    var open = c.status === 'open';
    return '<article class="city-card ' + (open ? 'is-open' : 'is-soon') + '">' +
      '<span class="city-pin" aria-hidden="true"></span>' +
      '<div class="city-names">' +
        '<p class="city-name">' + c.name + '</p>' +
        '<p class="city-local" data-i18n="' + (c.key || '') + '">' + (I18N.ko[c.key] || '') + '</p>' +
      '</div>' +
      (c.date
        ? '<p class="city-date">' + c.date + '</p>'
        : '<p class="city-date" data-i18n="cityTba">' + I18N.ko.cityTba + '</p>') +
      '<p class="city-status"><span class="dot" aria-hidden="true"></span>' +
        (open ? 'RESERVATION OPEN' : 'COMING SOON') + '</p>' +
      '<a class="city-btn" href="#reservation" data-i18n="' + (open ? 'cityBtn' : 'cityBtnSoon') + '">' +
        (open ? I18N.ko.cityBtn : I18N.ko.cityBtnSoon) + '</a>' +
      '</article>';
  }).join('');
}

function applyLang(lang) {
  var d = I18N[lang];
  document.documentElement.lang = LANG_CODE[lang];
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    if (d[key] !== undefined) el.innerHTML = d[key];
  });
  // 채널 정렬: 해당 언어 핵심 채널을 맨 위로 + 추천 배지
  document.querySelectorAll('[data-channels]').forEach(function(list) {
    var rows = Array.from(list.querySelectorAll('[data-ch]'));
    rows.forEach(function(r) {
      var b = r.querySelector('.rec-badge');
      if (b) b.remove();
      if (r.getAttribute('data-ch') === PRIMARY[lang]) {
        list.prepend(r);
        var badge = document.createElement('span');
        badge.className = 'rec-badge';
        badge.textContent = d.badge;
        r.querySelector('span').after(badge);
      }
    });
  });
}

// ===== 네이버 지도 =====
// 키가 없거나 스크립트 로딩·인증에 실패하면 지도를 감추고 주소 안내(.map-fallback)로 대체한다.
function showMapFallback() {
  var el = document.getElementById('naverMap');
  var fb = document.querySelector('.map-fallback');
  if (el) el.hidden = true;
  if (fb) fb.hidden = false;
}

function initNaverMap() {
  var el = document.getElementById('naverMap');
  if (!el) return;

  // '크게 보기' 링크는 설정값 하나로 본문·대체 화면 모두 맞춘다
  document.querySelectorAll('[data-map-link]').forEach(function(a) {
    if (NAVER_MAP.placeUrl) a.href = NAVER_MAP.placeUrl;
  });

  if (!NAVER_MAP.keyId) { showMapFallback(); return; }

  // 인증 실패(도메인 미등록·키 오류)는 네이버 API가 이 전역 함수로 알려준다
  window.navermap_authFailure = showMapFallback;

  var s = document.createElement('script');
  s.src = 'https://oapi.map.naver.com/openapi/v3/maps.js?' +
    encodeURIComponent(NAVER_MAP.keyParam) + '=' + encodeURIComponent(NAVER_MAP.keyId);
  s.async = true;
  s.onerror = showMapFallback;
  s.onload = function() {
    if (!window.naver || !naver.maps) { showMapFallback(); return; }
    var center = new naver.maps.LatLng(NAVER_MAP.lat, NAVER_MAP.lng);
    // 터치 기기에서 드래그를 열어두면 지도가 페이지 스크롤을 가로채므로 고정한다.
    // 데스크톱도 휠 줌은 끄고(스크롤 가로채기 방지) 확대/축소는 컨트롤로만 하게 둔다.
    var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    var map = new naver.maps.Map(el, {
      center: center,
      zoom: NAVER_MAP.zoom,
      scrollWheel: false,
      draggable: !coarse,
      pinchZoom: !coarse,
      disableDoubleTapZoom: coarse,
      scaleControl: false,
      mapDataControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: naver.maps.Position.TOP_RIGHT,
        style: naver.maps.ZoomControlStyle.SMALL
      }
    });
    new naver.maps.Marker({ position: center, map: map, title: NAVER_MAP.title });
  };
  document.head.appendChild(s);
}
initNaverMap();

document.querySelectorAll('.lang-switch button').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.lang-switch button').forEach(function(b) { b.setAttribute('aria-pressed', 'false'); });
    btn.setAttribute('aria-pressed', 'true');
    applyLang(btn.getAttribute('data-lang'));
  });
});

// 일본 팝업 섹션 토글 (기획서 09: 일정 없으면 비노출)
if (SHOW_JAPAN) {
  renderCities();
} else {
  var s = document.getElementById('japan');
  if (s) s.remove();
  document.querySelectorAll('a[href="#japan"]').forEach(function(a) {
    var li = a.closest('li');
    (li || a).remove();
  });
}

var toTop = document.getElementById('toTop');
window.addEventListener('scroll', function() {
  toTop.classList.toggle('show', window.scrollY > window.innerHeight * 0.6);
}, { passive: true });
toTop.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });

document.querySelectorAll('.faq-q').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var expanded = btn.getAttribute('aria-expanded') === 'true';
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.setAttribute('aria-expanded', String(!expanded));
    panel.style.maxHeight = expanded ? '0px' : panel.scrollHeight + 'px';
  });
});

var backdrop = document.getElementById('resvModal');
var modal = backdrop.querySelector('.modal');
var lastFocused = null;
function openModal() {
  lastFocused = document.activeElement;
  backdrop.classList.add('open');
  var first = modal.querySelector('a, button');
  if (first) first.focus();
  document.addEventListener('keydown', onKeydown);
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  backdrop.classList.remove('open');
  document.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
  if (lastFocused) lastFocused.focus();
}
function onKeydown(e) {
  if (e.key === 'Escape') { closeModal(); return; }
  if (e.key === 'Tab') {
    var f = modal.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
}
document.querySelectorAll('[data-open-modal]').forEach(function(b) { b.addEventListener('click', openModal); });
document.querySelectorAll('[data-close-modal]').forEach(function(b) { b.addEventListener('click', closeModal); });
backdrop.addEventListener('click', function(e) { if (e.target === backdrop) closeModal(); });

applyLang('ko');
})();
