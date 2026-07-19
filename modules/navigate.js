// navigate.js — 自动定位到种植区域

var navigate = {};

var gh = require("./gameHelper.js");

// 检测当前界面：返回 "world" / "base" / "unknown"
navigate.detectScene = function(imgs) {
    var baseInWorld = gh.findFirst(imgs.baseIcon, 0.7, "基地图标");
    if (baseInWorld) return "world";
    var worldInBase = gh.findFirst(imgs.worldIcon, 0.7, "世界图标");
    if (worldInBase) return "base";
    return "unknown";
};

// 双指内缩（缩放地图到最小）
navigate.pinchZoomOut = function(_log) {
    gh.pinchZoomOut();
    _log("双指缩放：缩小地图");
    sleep(1000);
    gh.pinchZoomOut();
    _log("双指缩放：再次缩小");
    sleep(1000);
};

// 点击锻造屋并返回，用于初始化位置
navigate.goToForgeAndBack = function(imgs, _log) {
    var forgePos = gh.findFirst(imgs.forgeHouse, 0.7, "锻造屋");
    if (!forgePos) {
        _log("未找到锻造屋，跳过位置初始化");
        return false;
    }
    click(forgePos.x + imgs.forgeHouse.getWidth() / 2, forgePos.y + imgs.forgeHouse.getHeight() / 2);
    _log("点击锻造屋");
    sleep(2000);

    // 检测锻造完成弹窗，点击底部关闭（与 weapon.js 一致）
    var dm = context.getResources().getDisplayMetrics();
    if (imgs.duanzaoDone) {
        var forgeDonePos = gh.findFirst(imgs.duanzaoDone, 0.7, "锻造完成");
        if (forgeDonePos) {
            click(random(100, dm.widthPixels - 100), dm.heightPixels - random(80, 200));
            _log("锻造完成，点击底部关闭");
            sleep(2000);
        }
    }

    var backPos = gh.findFirst(imgs.forgeBack, 0.7, "锻造屋返回");
    if (!backPos) {
        _log("未找到锻造屋返回按钮，等待...");
        sleep(2000);
        backPos = gh.findFirst(imgs.forgeBack, 0.7, "锻造屋返回");
    }
    if (backPos) {
        click(backPos.x + imgs.forgeBack.getWidth() / 2, backPos.y + imgs.forgeBack.getHeight() / 2);
        _log("点击锻造屋返回");
        sleep(1500);
    }
    return true;
};

// 从屏幕中间向左滑动，距离为锻造屋图片宽度
navigate.swipeLeft = function(imgs, _log) {
    var dm = context.getResources().getDisplayMetrics();
    var cx = Math.round(dm.widthPixels / 2);
    var cy = Math.round(dm.heightPixels / 2);
    var dist = imgs.forgeSize ? imgs.forgeSize.getWidth() : Math.round(dm.widthPixels / 5);
    var rand = random(-20, 20);
    swipe(cx + rand, cy, cx + dist + rand, cy, 2000 + random(-100, 100));
    _log("向右滑动（距离: " + dist + "px）");
    sleep(2000);
};

// 完整定位流程
navigate.autoLocate = function(imgs, _log) {
    _log("开始自动定位...");

    // 1. 检测当前界面
    var scene = navigate.detectScene(imgs);
    _log("当前界面: " + (scene === "world" ? "世界" : scene === "base" ? "基地" : "未知"));

    if (scene === "unknown") {
        _log("未在游戏界面，请手动打开游戏");
        return false;
    }

    // 2. 如果在世界，点击基地切换到基地
    if (scene === "world") {
        var basePos = gh.findFirst(imgs.baseIcon, 0.7, "基地图标");
        if (basePos) {
            click(basePos.x + imgs.baseIcon.getWidth() / 2, basePos.y + imgs.baseIcon.getHeight() / 2);
            _log("点击基地图标，切换到基地");
            sleep(3000);
        }
    }

    // 3. 双指缩放至最小地图
    navigate.pinchZoomOut(_log);

    // 等待世界地图完全加载再识图
    _log("等待地图加载...");
    sleep(3000);

    // 4. 点击锻造屋初始化位置（找不到则重试一次）
    var forgeOk = navigate.goToForgeAndBack(imgs, _log);
    if (!forgeOk) {
        _log("锻造屋未找到，等待2秒后重试...");
        sleep(2000);
        navigate.goToForgeAndBack(imgs, _log);
    }
    sleep(1000);

    // 5. 向左滑动定位到种植区
    navigate.swipeLeft(imgs, _log);

    _log("自动定位完成");
    return true;
};

module.exports = navigate;
