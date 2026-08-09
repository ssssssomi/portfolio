(function(){
// ===== 설정: 도쿄 출장 일정이 없으면 false → 섹션·내비 자동 숨김 (기획서 09) =====
var SHOW_TOKYO = true;

// ===== 다국어 사전 (기획서 08: 검수 번역문 전환 방식) =====
var I18N = {
  ko: {
    heroSub: '반영구 눈썹·입술 디자인이 완성될 때,<br>진짜 당신이 시작됩니다',
    cta: '예약 안내 보기',
    ctaChannel: '채널로 문의하기',
    introTitle: '균형있는 얼굴로의 안내',
    introCopy: '얼굴 구조와 피부 톤을 함께 읽는 1인 시술자의 프라이빗 반영구.<br>상담부터 리터치까지 한 사람이 끝까지 책임집니다.',
    quote: '"눈썹 한 올의 방향과 입술의 경계선, 그 미세한 차이가 얼굴 전체의 인상을 바꿉니다."',
    f1k: '운영 형태', f1v: '1인 시술자 · 완전 예약제',
    f2k: '취급 시술', f2v: '눈썹 반영구, 입술 반영구',
    f3k: '운영 지역', f3v: '서울 매장, 도쿄 기간형 출장',
    f4k: '상담 언어', f4v: '한국어, 영어, 일본어, 중국어',
    svKo: '지역 물가를 반영해 국가·지역별 가격을 분리해 안내합니다',
    browKo: '눈썹 반영구', lipKo: '입술 반영구',
    pfKo: '모델 공개 동의를 받은 사진만 게재합니다',
    pfNote: '얼굴형과 모류에 맞춘 결 표현으로, 화장하지 않아도 정돈된 인상을 만듭니다.',
    faqKicker: '자주 묻는 질문',
    q1: '시술 전 준비해야 할 것이 있나요?',
    a1: '시술 최소 3일 전부터 음주와 카페인 섭취를 줄여주시고, 눈썹·입술 부위의 각질 제거나 필링 시술은 2주 이상 간격을 두는 것을 권장합니다.',
    q2: '리터치는 언제, 어떻게 진행되나요?',
    a2: '1차 시술 후 4주 이내 리터치는 무료로 진행됩니다. 도쿄 출장의 경우 다음 출장 일정에 맞춰 리터치 예약을 안내드립니다.',
    q3: '해외에서도 예약할 수 있나요?',
    a3: '영어·일본어·중국어 상담이 가능하며, WhatsApp·LINE·WeChat 중 편한 채널로 예약 조건을 안내해 드립니다.',
    tokyoNote: '정확한 장소는 예약금 확인 후 안내드립니다.',
    tokyoBtn: 'LINE으로 문의',
    notice: '현재 온라인 예약 시스템은 준비 중입니다.<br><strong>아래 채널로 문의</strong>해 주시면 예약 가능한 일정과 예약금 안내를 도와드립니다.',
    s1: '원하는 시술과 희망 날짜를 정합니다.', s2: '편한 채널로 문의합니다.',
    s3: '시술 국가·지역과 가능한 일정을 안내받습니다.', s4: '계좌 또는 PayPal로 예약금을 입금합니다.',
    s5: '입금 확인 후 예약이 최종 확정됩니다.',
    locAddr: '주소', locAddrV: '서울특별시 (상세 주소 확정 예정)',
    locHours: '운영시간', locHoursV: '화–토 11:00–19:00 · 완전 예약제',
    locOff: '휴무', locOffV: '매주 일·월요일',
    locAsk: '문의', locAskV: '카카오채널 · 네이버플레이스',
    locMap: '구글 지도에서 크게 보기 →',
    modalDesc: '현재 온라인 예약 시스템은 준비 중입니다.<br>편하신 채널로 문의해 주시면 일정과 예약금 안내를 도와드립니다.',
    modalSteps: '문의 → 일정 확인 → <strong>예약금 입금(계좌/PayPal)</strong> → 입금 확인 후 <strong>예약 확정</strong><br>리터치 및 주의사항은 확정 시 함께 안내드립니다.',
    external: '채널 선택 시 외부 서비스로 이동합니다.',
    badge: '추천'
  },
  en: {
    heroSub: 'When your brow & lip design is complete,<br>the real you begins.',
    cta: 'Reservation Guide',
    ctaChannel: 'Contact via Channels',
    introTitle: 'A Guide to a Balanced Face',
    introCopy: 'Private permanent makeup by a single artist who reads your facial structure and skin tone.<br>One person takes care of everything, from consultation to retouch.',
    quote: '"The direction of a single brow hair, the border of the lips — these subtle differences change the entire impression."',
    f1k: 'Studio', f1v: 'Single artist · By appointment only',
    f2k: 'Services', f2v: 'Brow PMU, Lip PMU',
    f3k: 'Locations', f3v: 'Seoul studio, Tokyo pop-up',
    f4k: 'Languages', f4v: 'Korean, English, Japanese, Chinese',
    svKo: 'Prices are listed separately by country and region.',
    browKo: 'Eyebrow Permanent Makeup', lipKo: 'Lip Permanent Makeup',
    pfKo: 'Only photos with model consent are posted.',
    pfNote: 'Hair-stroke work tailored to your face shape — a polished look, even without makeup.',
    faqKicker: 'Frequently Asked Questions',
    q1: 'How should I prepare before the procedure?',
    a1: 'Please avoid alcohol and caffeine for at least 3 days before your visit, and leave 2+ weeks after any exfoliation or peeling near the brow/lip area.',
    q2: 'When and how is the retouch done?',
    a2: 'A free retouch is included within 4 weeks of the first session. For Tokyo pop-ups, retouch is scheduled with the next visit.',
    q3: 'Can I book from overseas?',
    a3: 'Consultations are available in English, Japanese and Chinese via WhatsApp, LINE or WeChat.',
    tokyoNote: 'Exact location is shared after deposit confirmation.',
    tokyoBtn: 'Contact via WhatsApp',
    notice: 'Online booking is coming soon.<br><strong>Contact us via the channels below</strong> for available dates and deposit guidance.',
    s1: 'Choose your service and preferred date.', s2: 'Reach out via your preferred channel.',
    s3: 'Receive available dates for your country/region.', s4: 'Pay the deposit via bank transfer or PayPal.',
    s5: 'Your reservation is confirmed once the deposit is verified.',
    locAddr: 'Address', locAddrV: 'Seoul, Korea (details TBA)',
    locHours: 'Hours', locHoursV: 'Tue–Sat 11:00–19:00 · By appointment',
    locOff: 'Closed', locOffV: 'Sunday & Monday',
    locAsk: 'Contact', locAskV: 'WhatsApp · Instagram',
    locMap: 'View larger map on Google Maps →',
    modalDesc: 'Online booking is coming soon.<br>Contact us via your preferred channel for dates and deposit guidance.',
    modalSteps: 'Inquiry → Date check → <strong>Deposit (bank/PayPal)</strong> → <strong>Confirmed</strong> after verification.<br>Retouch & aftercare details are shared upon confirmation.',
    external: 'Selecting a channel opens an external service.',
    badge: 'Recommended'
  },
  ja: {
    heroSub: '眉とリップのデザインが完成したとき、<br>本当のあなたが始まります。',
    cta: 'ご予約のご案内',
    ctaChannel: 'チャンネルで問い合わせ',
    introTitle: 'バランスのとれた顔立ちへ',
    introCopy: '顔の構造と肌のトーンを読み解く、1人の施術者によるプライベートアートメイク。<br>カウンセリングからリタッチまで、最後まで責任を持って担当します。',
    quote: '「眉一本の流れ、唇の輪郭線。その繊細な差が、顔全体の印象を変えます。」',
    f1k: '運営形態', f1v: '施術者1名 · 完全予約制',
    f2k: '施術内容', f2v: '眉アートメイク、リップアートメイク',
    f3k: 'エリア', f3v: 'ソウル店舗、東京の期間限定出張',
    f4k: '対応言語', f4v: '韓国語・英語・日本語・中国語',
    svKo: '国・地域ごとに料金を分けてご案内しています。',
    browKo: '眉アートメイク', lipKo: 'リップアートメイク',
    pfKo: 'モデルの掲載同意を得た写真のみ掲載しています。',
    pfNote: '顔立ちと毛流れに合わせた毛並み表現で、すっぴんでも整った印象に。',
    faqKicker: 'よくあるご質問',
    q1: '施術前に準備することはありますか？',
    a1: '施術の3日前から飲酒・カフェインを控えていただき、眉・唇まわりの角質ケアやピーリングは2週間以上空けることをおすすめします。',
    q2: 'リタッチはいつ、どのように行われますか？',
    a2: '初回施術後4週間以内のリタッチは無料です。東京出張の場合は、次回の出張日程に合わせてご案内します。',
    q3: '海外からでも予約できますか？',
    a3: '英語・日本語・中国語での相談が可能です。LINE・WhatsApp・WeChatでご案内いたします。',
    tokyoNote: '正確な場所は予約金確認後にご案内します。',
    tokyoBtn: 'LINEで問い合わせ',
    notice: 'オンライン予約は現在準備中です。<br><strong>下記のチャンネルからお問い合わせ</strong>いただければ、空き日程と予約金をご案内します。',
    s1: 'ご希望の施術と日程をお決めください。', s2: 'ご都合の良いチャンネルからお問い合わせください。',
    s3: '施術地域と空き日程をご案内します。', s4: '銀行振込またはPayPalで予約金をお支払いください。',
    s5: 'ご入金確認後、予約が確定します。',
    locAddr: '住所', locAddrV: 'ソウル特別市（詳細は追ってご案内）',
    locHours: '営業時間', locHoursV: '火–土 11:00–19:00 · 完全予約制',
    locOff: '定休日', locOffV: '日曜・月曜',
    locAsk: 'お問い合わせ', locAskV: 'LINE · Instagram',
    locMap: 'Googleマップで大きく見る →',
    modalDesc: 'オンライン予約は準備中です。<br>ご都合の良いチャンネルからお問い合わせください。',
    modalSteps: 'お問い合わせ → 日程確認 → <strong>予約金のお支払い（振込/PayPal）</strong> → 確認後<strong>予約確定</strong><br>リタッチと注意事項は確定時にご案内します。',
    external: 'チャンネル選択で外部サービスに移動します。',
    badge: 'おすすめ'
  },
  zh: {
    heroSub: '当眉唇设计完成之时，<br>真正的你由此开始。',
    cta: '预约指南',
    ctaChannel: '通过渠道咨询',
    introTitle: '通往均衡面容的指引',
    introCopy: '由一位技师亲自解读脸部结构与肤色的私人半永久定妆。<br>从咨询到补色，全程由同一人负责到底。',
    quote: '"一根眉毛的走向、唇部的轮廓线，这些细微的差别足以改变整张脸的印象。"',
    f1k: '经营形式', f1v: '一人技师 · 完全预约制',
    f2k: '服务项目', f2v: '眉部半永久、唇部半永久',
    f3k: '服务地区', f3v: '首尔门店、东京限期出差',
    f4k: '沟通语言', f4v: '韩语、英语、日语、中文',
    svKo: '根据各国家/地区物价分别标示价格。',
    browKo: '眉部半永久', lipKo: '唇部半永久',
    pfKo: '仅展示已获得模特同意的照片。',
    pfNote: '依据脸型与毛流定制的线条表现，素颜也能拥有精致印象。',
    faqKicker: '常见问题',
    q1: '术前需要做什么准备？',
    a1: '术前至少3天请减少饮酒和咖啡因摄入；眉唇部位的去角质或焕肤护理请间隔2周以上。',
    q2: '补色什么时候进行、如何进行？',
    a2: '首次操作后4周内可免费补色。东京出差的情况，将按照下次出差日程为您安排。',
    q3: '在海外也可以预约吗？',
    a3: '支持英语、日语、中文咨询，可通过WeChat、LINE、WhatsApp为您安排。',
    tokyoNote: '确切地点将在确认定金后告知。',
    tokyoBtn: '通过WeChat咨询',
    notice: '在线预约系统正在筹备中。<br>请<strong>通过以下渠道咨询</strong>，我们将为您安排可预约日期及定金事宜。',
    s1: '确定想要的项目和期望日期。', s2: '通过方便的渠道进行咨询。',
    s3: '获取所在国家/地区的可预约日程。', s4: '通过银行转账或PayPal支付定金。',
    s5: '确认到账后，预约正式确定。',
    locAddr: '地址', locAddrV: '首尔特别市（详细地址待定）',
    locHours: '营业时间', locHoursV: '周二–周六 11:00–19:00 · 完全预约制',
    locOff: '休息日', locOffV: '每周日、周一',
    locAsk: '咨询', locAskV: 'WeChat · Instagram',
    locMap: '在谷歌地图中查看 →',
    modalDesc: '在线预约系统正在筹备中。<br>请通过方便的渠道咨询，我们将为您安排日程与定金事宜。',
    modalSteps: '咨询 → 确认日程 → <strong>支付定金（转账/PayPal）</strong> → 确认后<strong>预约确定</strong><br>补色及注意事项将在确定时一并告知。',
    external: '选择渠道后将跳转至外部服务。',
    badge: '推荐'
  }
};
// 기획서 04·08: 언어별 핵심 CTA 분기
var PRIMARY = { ko: 'naver', en: 'whatsapp', ja: 'line', zh: 'wechat' };
var LANG_CODE = { ko: 'ko', en: 'en', ja: 'ja', zh: 'zh-Hans' };
// 구글 지도 임베드가 인식하는 hl 코드 (LANG_CODE와 표기가 달라 별도 관리)
var MAP_HL = { ko: 'ko', en: 'en', ja: 'ja', zh: 'zh-CN' };

function applyLang(lang) {
  var d = I18N[lang];
  document.documentElement.lang = LANG_CODE[lang];
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    if (d[key] !== undefined) el.innerHTML = d[key];
  });
  // 지도 라벨도 선택한 언어로 맞춘다 (src가 실제로 바뀔 때만 재로드)
  var map = document.querySelector('.map-embed');
  if (map) {
    var next = map.src.replace(/([?&]hl=)[^&]*/, '$1' + MAP_HL[lang]);
    if (next !== map.src) map.src = next;
  }
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

document.querySelectorAll('.lang-switch button').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.lang-switch button').forEach(function(b) { b.setAttribute('aria-pressed', 'false'); });
    btn.setAttribute('aria-pressed', 'true');
    applyLang(btn.getAttribute('data-lang'));
  });
});

// 도쿄 출장 토글 (기획서 09: 일정 없으면 비노출)
if (!SHOW_TOKYO) {
  var s = document.getElementById('tokyo');
  if (s) s.remove();
  document.querySelectorAll('a[href="#tokyo"]').forEach(function(a) {
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
