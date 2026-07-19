// weapon.js — 锻造任务：检测开始锻造按钮，检测锻造完成关闭弹窗

var weapon = {};

var gh = require("./gameHelper.js");

weapon.run = function(loadedImages, shouldStop, uiLog, freq, shipInFood, shipRunOnStart, weaponType, weaponLevel, onAction) {
    var _log = uiLog || function() { console.log.apply(null, arguments); };
    var interval = (freq && freq > 0) ? freq : 30;
    if (!loadedImages) { _log("资源未加载，请先启动游戏"); return; }
    var targetImg = loadedImages.duanzao;
    var doneImg = loadedImages.duanzaoDone;
    if (!targetImg) { _log("锻造图片未加载"); return; }
    var dm = context.getResources().getDisplayMetrics();
    var sw = dm.widthPixels, sh = dm.heightPixels;
    _log("锻造任务已启动，每" + interval + "s检测一次");
    var _lastShipHour = shipRunOnStart ? new Date().getHours() : -1;

    // 锻造类型/级别图片映射
    var typeImgMap = { "枪械": loadedImages.forgeTypeGun, "防具": loadedImages.forgeTypeArmor, "兵刃": loadedImages.forgeTypeBlade };
    var levelImgMap = { "蓝级": loadedImages.forgeLevelBlue, "紫级": loadedImages.forgeLevelPurple, "橙级": loadedImages.forgeLevelOrange };

    function enterForge() {
        var forgePos = gh.findFirst(loadedImages.forgeHouse, 0.7, "锻造屋");
        if (forgePos) {
            click(forgePos.x + loadedImages.forgeHouse.getWidth() / 2, forgePos.y + loadedImages.forgeHouse.getHeight() / 2);
            _log("进入锻造屋");
            sleep(2000);
        }
    }

    function selectTypeAndLevel() {
        // 选择锻造种类
        var typeImg = typeImgMap[weaponType];
        if (typeImg) {
            var pos = gh.findFirst(typeImg, 0.8, weaponType + "未选中");
            if (pos) {
                click(pos.x + typeImg.getWidth() / 2, pos.y + typeImg.getHeight() / 2);
                _log("切换到 " + weaponType);
                sleep(1500);
            }
        }
        // 选择锻造级别
        var levelImg = levelImgMap[weaponLevel];
        if (levelImg) {
            var lpos = gh.findFirst(levelImg, 0.8, weaponLevel);
            if (lpos) {
                click(lpos.x + levelImg.getWidth() / 2, lpos.y + levelImg.getHeight() / 2);
                _log("选择 " + weaponLevel);
                sleep(1500);
            }
        }
    }

    // 启动时进入锻造屋并选择种类/级别
    enterForge();
    selectTypeAndLevel();

    while (!shouldStop()) {
        // ===== 整点万吨商船 =====
        if (shipInFood) {
            var merchantShip = require("./merchantShip.js");
            var nowH = new Date().getHours();
            if (nowH !== _lastShipHour) {
                _log("[商船] 整点到达 (" + nowH + ":00)，执行一次");
                merchantShip.runHourlyOnce(loadedImages, _log, shouldStop);
                _lastShipHour = nowH;
                // 商船回到基地后重新进入锻造屋
                enterForge();
                selectTypeAndLevel();
                if (shouldStop()) return;
                continue;
            }
        }

        // 检测锻造完成弹窗，点击底部关闭
        if (doneImg) {
            var donePos = gh.findFirst(doneImg, 0.7, "锻造完成");
            if (donePos) {
                click(random(100, sw - 100), sh - random(80, 200));
                _log("锻造完成，点击底部关闭");
                sleep(2000);
            }
        }
        // 检测开始锻造
        var pos = gh.findFirst(targetImg, 0.7, "开始锻造");
        if (pos) {
            click(pos.x + targetImg.getWidth() / 2, pos.y + targetImg.getHeight() / 2);
            _log("点击开始锻造: (" + pos.x + ", " + pos.y + ")");
            if (onAction) onAction();
        }
        for (var i = 0; i < interval && !shouldStop(); i++) sleep(1000);
    }
};

module.exports = weapon;
