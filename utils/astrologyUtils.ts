
import { EARTHLY_BRANCHES, HEAVENLY_STEMS, PALACE_NAMES, MAJOR_STARS, MINOR_STARS_POOL, STAR_INFO_MAP } from '../constants';
import { PalaceData, BaZiChart, BaZiPillar } from '../types';

// Convert hour (0-23) to Earthly Branch index (0-11)
export const getTimeBranchIndex = (hour: number): number => {
  if (hour >= 23 || hour < 1) return 0; 
  return Math.floor((hour + 1) / 2);
};

// Get Earthly Branch index for a specific year
export const getYearBranchIndex = (year: number): number => {
  let idx = (year - 4) % 12;
  if (idx < 0) idx += 12;
  return idx;
};

const getEquationOfTime = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const b = (360 * (dayOfYear - 81) / 365) * (Math.PI / 180);
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
  return eot;
};

const getTrueSolarTime = (birthDate: string, birthTime: string, longitudeStr: string): Date => {
  const date = new Date(`${birthDate}T${birthTime}`);
  const longitude = parseFloat(longitudeStr) || 120.0;
  const longitudeOffsetMinutes = (longitude - 120) * 4;
  const eotMinutes = getEquationOfTime(date);
  const totalOffsetMinutes = longitudeOffsetMinutes + eotMinutes;
  const solarDate = new Date(date.getTime() + totalOffsetMinutes * 60000);
  return solarDate;
};

// --- New Interpretation Logic ---

// Five Elements Mapping
const STEM_ELEMENTS: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', 
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
};
const BRANCH_ELEMENTS: Record<string, string> = {
  '寅': '木', '卯': '木', '巳': '火', '午': '火', '辰': '土', '戌': '土', '丑': '土', '未': '土', 
  '申': '金', '酉': '金', '亥': '水', '子': '水'
};

// Calculate Five Elements Distribution for the Chart
export const calculateFiveElementsScore = (bazi: BaZiChart) => {
  const scores = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
  
  const addScore = (char: string, type: 'stem' | 'branch') => {
    let element = '';
    if (type === 'stem') element = STEM_ELEMENTS[char];
    if (type === 'branch') element = BRANCH_ELEMENTS[char];
    if (element && element in scores) {
      // Branch (Root) weight 1.2, Stem weight 1.0
      scores[element as keyof typeof scores] += (type === 'branch' ? 1.2 : 1.0); 
    }
  };

  [bazi.year, bazi.month, bazi.day, bazi.hour].forEach(pillar => {
    addScore(pillar.stem, 'stem');
    addScore(pillar.branch, 'branch');
  });

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const distribution = Object.entries(scores).map(([el, score]) => ({
    element: el,
    score: score,
    percent: total === 0 ? 0 : Math.round((score / total) * 100)
  }));

  return distribution.sort((a, b) => b.score - a.score);
};

// Interpret specific star in specific palace (Detailed Version)
export const getSpecificStarInterpretation = (star: string, palaceName: string): string => {
  const baseInfo = STAR_INFO_MAP[star];
  if (!baseInfo) return "";
  
  const starName = `【${star}星】`;

  // 1. Life Palace (Ming Gong) - Core Personality
  if (palaceName === '命宮') {
    let desc = `${starName}坐守命宮。${star}五行屬${baseInfo.element}，${baseInfo.description}。\n\n`;
    desc += `**性格特質**：您天生具有${star}的能量氣場。`;
    
    if (['紫微', '天府', '太陽', '太陰'].includes(star)) {
      desc += `這是一顆領導型或貴氣型的星曜，意味著您自尊心強，有宏觀視野，不喜歡被拘束。在人群中往往不怒自威，容易成為核心人物。但需注意有時是否過於主觀或清高。`;
    } else if (['武曲', '七殺', '破軍', '貪狼'].includes(star)) {
      desc += `這是一顆開創型或行動力強的星曜。您性格剛毅果決，喜歡冒險和挑戰，不滿足於現狀。人生軌跡往往起伏較大，屬於「富貴險中求」的類型。`;
    } else if (['天機', '天同', '天梁', '天相'].includes(star)) {
      desc += `這是一顆輔佐型或智慧型的星曜。您心思細膩，擅長思考與策劃，待人處事較為圓融。比起衝鋒陷陣，您更適合運籌帷幄或從事專業技術領域。`;
    } else if (['巨門', '廉貞'].includes(star)) {
      desc += `這是一顆個性鮮明且複雜的星曜。您觀察力敏銳，具有批判精神或獨特的魅力。口才佳或社交手腕靈活，但也容易因直言或情緒多變而招惹是非。`;
    }
    return desc;
  } 
  
  // 2. Spouse Palace (Fu Qi) - Love & Marriage
  if (palaceName === '夫妻') {
    let desc = `${starName}入夫妻宮。象徵您對感情的態度及配偶的特質。\n\n`;
    if (['紫微', '太陽', '天府', '武曲'].includes(star)) {
      desc += `**配偶特質**：您的另一半通常能力出眾，個性獨立甚至強勢，在事業上多有所成。您欣賞強者，但相處時易有「誰說了算」的爭執。建議多包容對方的事業心。`;
    } else if (['天機', '太陰', '天同', '天相'].includes(star)) {
      desc += `**配偶特質**：您的另一半多半溫柔體貼，或外貌清秀斯文。感情相處較注重精神層面的交流與生活情趣。對方可能比較依賴您，或需要您的呵護。`;
    } else if (['貪狼', '廉貞', '七殺', '破軍'].includes(star)) {
      desc += `**感情運勢**：這是一組變動較大的星曜。代表您的感情生活豐富精彩，配偶個性剛烈或極具魅力（桃花旺）。相處模式較為激烈，需防爭吵或第三者介入，晚婚或聚少離多較佳。`;
    } else {
      desc += `**感情運勢**：配偶可能帶有${star}星的特質，${baseInfo.description.split('，')[1]}。雙方緣分深厚，但相處細節需視星曜廟陷而定。`;
    }
    return desc;
  } 

  // 3. Wealth Palace (Cai Bo) - Money & Career
  if (palaceName === '財帛') {
    let desc = `${starName}鎮守財帛宮。主宰您的理財觀念與財富來源。\n\n`;
    if (['武曲', '太陰', '天府', '祿存'].includes(star)) {
      desc += `**財運分析**：大吉。此乃正財星入庫，代表您天生對金錢敏感，善於理財與積蓄。財源穩定，且具有聚財能力，適合經商或金融投資，晚年財庫豐盈。`;
    } else if (['貪狼', '破軍', '七殺'].includes(star)) {
      desc += `**財運分析**：主偏財或橫財。您的財運帶有投機或波動性質，敢於冒險投資，有機會一夜致富，但也容易大進大出。建議見好就收，避免過度貪婪。`;
    } else if (['紫微', '太陽', '天梁'].includes(star)) {
      desc += `**財運分析**：名大於利。您的財富多半伴隨著聲望或地位而來。適合從事公職、管理或專業顧問，先求名聲響亮，財富自然會隨之而來。`;
    } else {
      desc += `**財運分析**：您的賺錢模式傾向於靠${baseInfo.description.substring(0, 4)}，財運平穩，需靠專業技能或辛勤工作來累積財富。`;
    }
    return desc;
  }
  
  // 4. Career Palace (Guan Lu) - Career & Success
  if (palaceName === '官祿') {
     let desc = `${starName}坐守官祿宮。反映您的職場表現與適合行業。\n\n`;
     if (['紫微', '太陽', '天相', '廉貞'].includes(star)) {
       desc += `**事業方向**：您具有領袖氣質，適合從事管理、行政、政治或公共關係等工作。在組織中容易獲得提拔，擔任主管職務。`;
     } else if (['武曲', '七殺', '破軍'].includes(star)) {
       desc += `**事業方向**：您適合軍警、工程、重工業或外勤業務等需要開創力與執行力的工作。創業成功的機率也很高，屬於實幹型人才。`;
     } else if (['文昌', '文曲', '天機', '太陰'].includes(star)) {
       desc += `**事業方向**：您適合從事學術研究、教育、設計、藝術或企劃等需要動腦與創意的行業。您的才華是您在職場上最大的武器。`;
     } else {
       desc += `**事業方向**：工作風格受${star}星影響，表現為${baseInfo.description.split('，')[1]}，適合穩定的行政職或專業技術職。`;
     }
     return desc;
  }

  // General interpretation for other palaces
  return `${starName}在${palaceName}。\n\n**宮位影響**：此宮位代表您人生中的${PALACE_NAMES.indexOf(palaceName) >= 0 ? palaceName : '該領域'}面向。${star}星在此，意味著您在處理這方面事務時，態度會傾向於「${baseInfo.description.split('，')[0]}」。\n\n**大師點評**：星曜入宮顯示吉凶，但更需看三方四正的會照。若有吉星（如文昌、左輔）相佐，則${star}星的優點更易發揮；若遇煞星（如擎羊、火星），則需防範${star}星負面特質的顯現。`;
};

// Interpret BaZi Pillar Relationship (Simplified)
export const getPillarDetailedMeaning = (pillar: BaZiPillar, type: string): string => {
  const stemEl = STEM_ELEMENTS[pillar.stem];
  const branchEl = BRANCH_ELEMENTS[pillar.branch];

  // Simplify the abstract relation logic to human behavior
  let relation = "";
  if (stemEl === branchEl) {
    relation = "【表裡如一】：天干與地支五行相同，代表這個階段您的外在表現與內心想法非常一致，能量純粹，執行力強。";
  } else if (['木火', '火土', '土金', '金水', '水木'].includes(stemEl + branchEl)) {
    relation = "【順勢而為】：外在環境（天干）滋養內在基礎（地支），代表雖然表面忙碌，但對您自身的積累是有益的，發展順遂。";
  } else if (['木火', '火土', '土金', '金水', '水木'].includes(branchEl + stemEl)) {
    relation = "【根基深厚】：內在實力（地支）支撐外在表現（天干），代表您底氣足，容易得到他人的支持或長輩的幫助。";
  } else {
    relation = "【磨礪成長】：天干與地支相剋，代表外在機遇與內在想法有衝突，雖然過程較為波折，但這也是一種自我突破和鍛煉。";
  }

  let specific = "";
  if (type === '年柱') specific = `此柱代表**幼年運及祖輩**。\n${relation}`;
  if (type === '月柱') specific = `此柱代表**青年運及性格核心**。\n${relation}\n這是八字中最重要的部分，決定了您的主要性格特質。`;
  if (type === '日柱') specific = `此柱代表**中年運及配偶**。\n${relation}\n日支也代表配偶宮，這暗示了您與另一半的相處模式。`;
  if (type === '時柱') specific = `此柱代表**晚年運及子女**。\n${relation}\n這是您人生最終的歸宿感。`;

  return specific;
};

export const calculateBaZi = (birthDate: string, birthTime: string, longitude: string): BaZiChart => {
  // 1. Get True Solar Time
  const solarDate = getTrueSolarTime(birthDate, birthTime, longitude);
  
  const solarYear = solarDate.getFullYear();
  const solarMonth = solarDate.getMonth() + 1;
  const solarHour = solarDate.getHours();
  
  // 2. Handle Rat Hour (Zi Shi) & Day Shift
  const calculationDate = new Date(solarDate);
  if (solarHour >= 23) {
    calculationDate.setDate(calculationDate.getDate() + 1);
  }

  const yearOffset = (solarYear - 1984 + 9000) % 60; 
  const yearStemIndex = (solarYear - 4) % 10;
  const yearBranchIndex = (solarYear - 4) % 12;
  const yearPillar: BaZiPillar = {
    stem: HEAVENLY_STEMS[yearStemIndex < 0 ? yearStemIndex + 10 : yearStemIndex],
    branch: EARTHLY_BRANCHES[yearBranchIndex < 0 ? yearBranchIndex + 12 : yearBranchIndex],
    element: "命" 
  };

  const yearStemIdx = (yearStemIndex < 0 ? yearStemIndex + 10 : yearStemIndex) % 5;
  const monthStartStem = (yearStemIdx * 2 + 2) % 10; 
  let monthBranchIdx = (solarMonth + 1) % 12; 
  if (monthBranchIdx === 0 && solarDate.getDate() < 4) {
      monthBranchIdx = 1; 
  }
  const monthStemIdx = (monthStartStem + (monthBranchIdx - 2 + 12) % 12) % 10;
  
  const monthPillar: BaZiPillar = {
    stem: HEAVENLY_STEMS[monthStemIdx],
    branch: EARTHLY_BRANCHES[monthBranchIdx],
    element: "提"
  };

  const refDate = new Date('2000-01-01'); // Wu-Wu
  const cleanCalcDate = new Date(calculationDate.getFullYear(), calculationDate.getMonth(), calculationDate.getDate());
  const diffTime = cleanCalcDate.getTime() - refDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  const refStem = 4; // Wu
  const refBranch = 6; // Wu
  
  let dayStemIdx = (refStem + diffDays) % 10;
  if (dayStemIdx < 0) dayStemIdx += 10;
  let dayBranchIdx = (refBranch + diffDays) % 12;
  if (dayBranchIdx < 0) dayBranchIdx += 12;

  const dayPillar: BaZiPillar = {
    stem: HEAVENLY_STEMS[dayStemIdx],
    branch: EARTHLY_BRANCHES[dayBranchIdx],
    element: "元"
  };

  const dayStemMod5 = dayStemIdx % 5;
  const hourStartStem = (dayStemMod5 * 2) % 10;
  const hourBranchIdx = getTimeBranchIndex(solarHour);
  const hourStemIdx = (hourStartStem + hourBranchIdx) % 10;

  const hourPillar: BaZiPillar = {
    stem: HEAVENLY_STEMS[hourStemIdx],
    branch: EARTHLY_BRANCHES[hourBranchIdx],
    element: "時"
  };
  
  const solarTimeStr = `${solarDate.getFullYear()}-${(solarDate.getMonth()+1).toString().padStart(2,'0')}-${solarDate.getDate().toString().padStart(2,'0')} ${solarDate.getHours().toString().padStart(2,'0')}:${solarDate.getMinutes().toString().padStart(2,'0')}`;

  return { year: yearPillar, month: monthPillar, day: dayPillar, hour: hourPillar, solarTime: solarTimeStr };
};

export const calculateChart = (birthDate: string, birthTime: string): PalaceData[] => {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const hour = parseInt(birthTime.split(':')[0], 10);
  const timeBranchIdx = getTimeBranchIndex(hour);

  let mingIndex = (2 + (month - 1) - timeBranchIdx) % 12;
  if (mingIndex < 0) mingIndex += 12;

  const palaces: PalaceData[] = [];

  for (let i = 0; i < 12; i++) {
    let labelIndex = (mingIndex - i) % 12;
    if (labelIndex < 0) labelIndex += 12;

    const stars: string[] = [];
    const minor: string[] = [];
    
    const hash = (date.getTime() + i) % 100;
    
    if (hash % 3 === 0) stars.push(MAJOR_STARS[hash % MAJOR_STARS.length]);
    if (hash % 7 === 0) stars.push(MAJOR_STARS[(hash + 5) % MAJOR_STARS.length]);
    if (hash % 11 === 0 && stars.length < 2) stars.push(MAJOR_STARS[(hash + 2) % MAJOR_STARS.length]);

    if (hash % 2 === 0) minor.push(MINOR_STARS_POOL[hash % 4]);
    if (hash % 5 === 0) minor.push(MINOR_STARS_POOL[4 + (hash % 4)]);
    if (hash % 6 === 0) minor.push(MINOR_STARS_POOL[8 + (hash % 4)]);

    const startAge = (labelIndex * 10) + 2;
    const endAge = startAge + 9;
    const stemIndex = (i * 2 + date.getFullYear()) % 10;

    palaces.push({
      id: i,
      earthlyBranch: EARTHLY_BRANCHES[i],
      name: PALACE_NAMES[labelIndex],
      majorStars: stars,
      minorStars: minor,
      heavenlyStem: HEAVENLY_STEMS[stemIndex],
      ageRange: `${startAge}-${endAge}`
    });
  }

  return palaces;
};
