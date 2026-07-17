// theme.js — 颜色、作物配置、兑换码

var C = {
    bg: "#F2F2F7",
    card: "#FFFFFF",
    textPrimary: "#1C1C1E",
    textSecondary: "#8E8E93",
    textMuted: "#AEAEB2",
    accent: "#A04468",
    accentDim: "#C76088",
    green: "#34C759",
    error: "#FF3B30"
};

var cropStatMap = {
    "水稻": "rice", "玉米": "corn", "土豆": "potato",
    "西红柿": "tomato", "胡萝卜": "carrot", "卷心菜": "cabbage", "大豆": "soybean"
};

var redeemCodes = [
    { code: "WATER2026VIP", desc: "钻石 x100", time: new Date(2026, 6, 17, 9, 30) },
    { code: "FARM888", desc: "金币 x5000", time: new Date(2026, 6, 17, 10, 15) },
    { code: "CROP666", desc: "种子礼包", time: new Date(2026, 6, 16, 20, 0) }
];

var foodOptions = ["水稻", "玉米", "土豆", "西红柿", "胡萝卜", "卷心菜", "大豆"];

module.exports = { C: C, cropStatMap: cropStatMap, redeemCodes: redeemCodes, foodOptions: foodOptions };
