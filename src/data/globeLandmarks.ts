import type { GlobeLandmark } from '@/types/globe'

// 地标是城市意象，不代表实际会议场馆；新增城市没有地标时仍正常显示统计点。
export const GLOBE_LANDMARKS: GlobeLandmark[] = [
  {
    cityKey: 'Paris, France',
    name: '巴黎微缩景观',
    kind: 'eiffel',
    features: ['埃菲尔铁塔', '凯旋门', '卢浮宫金字塔', '塞纳河'],
  },
  {
    cityKey: 'Hong Kong, China',
    name: '香港微缩景观',
    kind: 'hongkong',
    features: ['中银大厦', '国际金融中心二期', '钟楼', '天星小轮'],
  },
  {
    cityKey: 'Vancouver, Canada',
    name: '温哥华微缩景观',
    kind: 'vancouver',
    features: ['加拿大广场', '海港中心', '科学世界', '海岸山林'],
  },
  {
    cityKey: 'Sydney, Australia',
    name: '悉尼微缩景观',
    kind: 'opera',
    features: ['悉尼歌剧院', '悉尼海港大桥', '悉尼塔', '海港渡轮'],
  },
  {
    cityKey: 'Seattle, United States',
    name: '西雅图微缩景观',
    kind: 'needle',
    features: ['太空针塔', '西雅图摩天轮', '派克市场', '常青海岸'],
  },
  {
    cityKey: 'Singapore, Singapore',
    name: '新加坡微缩景观',
    kind: 'marina',
    features: ['滨海湾金沙', '鱼尾狮', '艺术科学博物馆', '滨海湾超级树'],
  },
  {
    cityKey: 'Beijing, China',
    name: '北京微缩景观',
    kind: 'beijing',
    features: ['天坛祈年殿', '故宫午门', '央视总部大楼', '中式园林'],
  },
  {
    cityKey: 'Seoul, South Korea',
    name: '首尔微缩景观',
    kind: 'seoul',
    features: ['N 首尔塔', '景福宫光化门', '乐天世界塔', '汉江'],
  },
  {
    cityKey: 'Macao, China',
    name: '澳门微缩景观',
    kind: 'macao',
    features: ['大三巴牌坊', '新葡京酒店', '东望洋灯塔', '议事亭前地'],
  },
  {
    cityKey: 'San Francisco, United States',
    name: '旧金山微缩景观',
    kind: 'sanfrancisco',
    features: ['金门大桥', '泛美金字塔', '科伊特塔', '彩绘仕女与缆车'],
  },
]
