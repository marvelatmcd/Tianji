export const EARTHLY_BRANCHES = [
  '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'
];

export const HEAVENLY_STEMS = [
  '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'
];

export const ZODIAC_ANIMALS = [
  '鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'
];

export const PALACE_NAMES = [
  '命宮', '兄弟', '夫妻', '子女', '財帛', '疾厄', 
  '遷移', '交友', '官祿', '田宅', '福德', '父母'
];

export const MAJOR_STARS = [
  '紫微', '天機', '太陽', '武曲', '天同', '廉貞', 
  '天府', '太陰', '貪狼', '巨門', '天相', '天梁', '七殺', '破軍'
];

export const MINOR_STARS_POOL = [
  '文昌', '文曲', '左輔', '右弼', '天魁', '天鉞', 
  '擎羊', '陀羅', '火星', '鈴星', '地空', '地劫'
];

// Plain language definitions for Palaces
export const PALACE_DEFINITIONS: Record<string, string> = {
  '命宮': '核心自我：代表你的個性特質、天賦潛力以及整體的命運格局。這是解讀命盤的起點。',
  '兄弟': '人際手足：代表與兄弟姐妹、知心好友或合作夥伴的關係，也暗示現金流動的狀況。',
  '夫妻': '感情婚姻：代表對感情的態度、配偶的類型、婚姻關係的吉凶以及相處模式。',
  '子女': '親子晚輩：代表與子女的緣分、教育方式，也象徵你的創造力、桃花運及晚年運勢。',
  '財帛': '財運理財：代表賺錢的能力、財富的來源、理財觀念以及物質生活的享受程度。',
  '疾厄': '身心健康：代表身體體質、易患疾病的傾向，也隱喻深層潛意識及心理狀態。',
  '遷移': '外出機遇：代表出外發展的運勢、社交場合的表現、貴人運以及環境適應能力。',
  '交友': '社交人脈：代表普通朋友、部屬、同事的關係，反映你的人際圈層及受助力的多寡。',
  '官祿': '事業學業：代表工作運勢、適合的職業方向、職場地位、創業能力及求學考試運。',
  '田宅': '不動產運：代表居住環境、購屋運勢、家庭氛圍，也象徵財庫的積累與守財能力。',
  '福德': '精神享受：代表內心的安寧、興趣愛好、精神生活的品質，以及你的運氣和福氣。',
  '父母': '長輩緣分：代表與父母的關係、遺傳基因、長輩的提攜助力，也象徵容貌與文書運。'
};

// Definitions for BaZi Pillars
export const PILLAR_DEFINITIONS: Record<string, { title: string, desc: string, age: string }> = {
  '年柱': { title: '根基 (祖上)', desc: '代表祖父母輩、祖業根基及幼年運勢。反映了你的出身背景與早年環境。', age: '1-16歲' },
  '月柱': { title: '門戶 (父母/兄弟)', desc: '代表父母、兄弟姐妹及青年運勢。這是八字中「提綱」，對性格和事業格局影響最大。', age: '17-32歲' },
  '日柱': { title: '自身 (夫妻宮)', desc: '天干代表「你自己」(日主)，地支代表配偶(夫妻宮)。反映中年運勢、婚姻生活及核心性格。', age: '33-48歲' },
  '時柱': { title: '歸宿 (子女/事業)', desc: '代表子女、下屬、晚年運勢及最終的事業成就。反映了你人生下半場的收成與歸宿。', age: '49歲以後' }
};

// Dictionary for Star Explanations (Traditional Chinese)
export const STAR_INFO_MAP: Record<string, { element: string, description: string }> = {
  '紫微': { element: '土', description: '帝王之星，掌管尊貴與權力，具有解厄制化之功。' },
  '天機': { element: '木', description: '智慧之星，主思慮變通，長於策劃與計算。' },
  '太陽': { element: '火', description: '權貴之星，主博愛與付出，象徵光明與熱能。' },
  '武曲': { element: '金', description: '財帛之星，主剛毅果決，長於理財與行動。' },
  '天同': { element: '水', description: '福德之星，主溫順協調，重享受與安樂。' },
  '廉貞': { element: '火', description: '次桃花星，主交際手腕，性格複雜多變，亦正亦邪。' },
  '天府': { element: '土', description: '財庫之星，主包容與守成，性格穩重，善於管理。' },
  '太陰': { element: '水', description: '財富之星，主溫柔細膩，象徵母性與陰柔之美。' },
  '貪狼': { element: '木/水', description: '桃花之星，主慾望與多才多藝，長於交際應酬。' },
  '巨門': { element: '水', description: '是非之星，主口才與分析，性格多疑，長於研究。' },
  '天相': { element: '水', description: '印鑑之星，主忠誠與服務，性格公正，樂於助人。' },
  '天梁': { element: '土', description: '蔭庇之星，主長壽與照顧，性格清高，具有領導力。' },
  '七殺': { element: '金/火', description: '將星，主肅殺與衝勁，性格剛烈，喜冒險犯難。' },
  '破軍': { element: '水', description: '耗星，主破壞與建設，性格衝動，喜新厭舊。' },
  '文昌': { element: '金', description: '科甲之星，主正統學術與功名。' },
  '文曲': { element: '水', description: '異路功名，主口才、藝術與才藝。' },
  '左輔': { element: '土', description: '貴人星，主圓融與輔佐。' },
  '右弼': { element: '水', description: '貴人星，主機智與輔佐。' },
  '擎羊': { element: '金', description: '刑星，主攻擊與剛強。' },
  '陀羅': { element: '金', description: '忌星，主拖延與固執。' },
  '火星': { element: '火', description: '煞星，主爆發與剛烈。' },
  '鈴星': { element: '火', description: '煞星，主隱忍與深沈。' },
};

export const BG_MUSIC_URL = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3";
