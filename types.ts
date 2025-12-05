export enum VoiceName {
  Puck = 'Puck',
  Charon = 'Charon',
  Kore = 'Kore',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
}

export interface AudioState {
  isGenerating: boolean;
  isPlaying: boolean;
  audioBuffer: AudioBuffer | null;
  audioBlob: Blob | null;
  error: string | null;
}

export const DEFAULT_TEXT = `在山野間行走,血液裡彷彿有了春天的氣息。腳步陷入曝露在太陽下的土丘,留下一串蝸牛般蜿蜒的足跡。遠眺那些丘壑重疊的山崖,心中不禁混淆了現實與幻景。
暫停腳步,靜心感受大自然的節奏。空氣中瀰漫著發酵落葉的清香,攜帶著大地賞賜的饋贈。河堤邊堆積的枯枝落葉垃圾,不時被微風震懾,揚起一陣陣塵土飛揚。
人類挾持著對自然的謅謊,循著隼質的步驟前行。放眼望去,連綿的山脈上矗立著參天古柏,那檜木般的氣息令人想起遙遠的秦檜故事。會稽山下,一條清澈的圳溝在林間蟄伏,匯成了一灘靜謐的瑯琊池塘。
行經一道關卡般的小徑,一艘漁船在池中緩緩航行,船艙中儲存著一整季節的採擷。拎著裝滿野菜的包袱,那些辛勤的劊子手也將馬上離開這片自然的樂園,踏上歸途。`;