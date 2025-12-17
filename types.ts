
export enum Gender {
  MALE = '乾造 (男)',
  FEMALE = '坤造 (女)',
}

export enum CalendarType {
  SOLAR = '陽曆',
  LUNAR = '陰曆',
}

export interface UserProfile {
  name: string;
  birthPlace: string;
  longitude: string; // Added Longitude for Solar Time
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  gender: Gender;
}

export interface BaZiPillar {
  stem: string; // 天干
  branch: string; // 地支
  element: string; // 納音五行 (Simplified for UI)
}

export interface BaZiChart {
  year: BaZiPillar;
  month: BaZiPillar;
  day: BaZiPillar;
  hour: BaZiPillar;
  solarTime: string; // To display the calculated True Solar Time
}

export interface PalaceData {
  id: number;
  earthlyBranch: string; // 地支
  name: string; // 宮名
  majorStars: string[]; // 14 Major stars
  minorStars: string[]; // Auxiliary stars
  heavenlyStem: string; // 天干
  ageRange: string; // 大限
}

export interface LuckyData {
  luckyColor: string;
  luckyNumber: string;
  luckyDirection: string;
  noblePerson: string; // Gui Ren
}

export interface AnalysisResult {
  centralSummary: string; // New: 4-character idiom
  baziAnalysis: string; // 八字簡批
  destinyPattern: string; // 命宮格局
  fiveElementsBalance: string; // 五行分析
  currentYearFortune: string; // 流年運勢
  advice: string; // 大師建議
  luckyData?: LuckyData; // Optional lucky elements for the card
}

export interface StarInfo {
  name: string;
  element: string;
  description: string;
}
