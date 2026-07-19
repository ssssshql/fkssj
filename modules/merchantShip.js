// merchantShip.js — 搁浅商船任务

var merchantShip = {};

var gh = require("./gameHelper.js");
var fleet = require("./fleet.js");

function runOnce(imgs, _log) {
    // 1. 点击搁浅商船图标
    var iconPos = gh.findFirst(imgs.shipIcon, 0.7, "商船图标");
    if (!iconPos) { _log("未找到商船图标"); return "fail"; }
    click(iconPos.x + imgs.shipIcon.getWidth() / 2, iconPos.y + imgs.shipIcon.getHeight() / 2);
    _log("点击商船图标");
    sleep(2000);

    // 2. 点击万吨商轮
    var largePos = gh.findFirst(imgs.shipLarge, 0.7, "万吨商轮");
    if (!largePos) { _log("未找到万吨商轮"); return "fail"; }
    click(largePos.x + imgs.shipLarge.getWidth() / 2, largePos.y + imgs.shipLarge.getHeight() / 2);
    _log("点击万吨商轮");
    sleep(2000);

    // 3. 检测万吨货轮是否在列表
    var inList = gh.findFirst(imgs.shipInList, 0.8, "货轮在列表");
    if (!inList) {
        _log("货轮不在列表，本轮已打完，关闭页面");
        // 关闭货轮列表
        var closeListPos = gh.findFirst(imgs.shipCloseList, 0.7, "关闭货轮列表");
        if (closeListPos) {
            click(closeListPos.x + imgs.shipCloseList.getWidth() / 2, closeListPos.y + imgs.shipCloseList.getHeight() / 2);
            _log("点击关闭货轮列表");
            sleep(1500);
        }
        // 关闭搁浅商船页面
        var closePagePos = gh.findFirst(imgs.shipClosePage, 0.7, "关闭搁浅商船页面");
        if (closePagePos) {
            click(closePagePos.x + imgs.shipClosePage.getWidth() / 2, closePagePos.y + imgs.shipClosePage.getHeight() / 2);
            _log("点击关闭搁浅商船页面");
            sleep(1500);
        }
        return "empty";
    }
    _log("货轮在列表中，准备前往");
    sleep(1000);

    // 4. 点击前往按钮（点击最上面的）
    var goBtns = gh.findAll(imgs.shipGoBtn, 0.7, "前往按钮");
    if (goBtns.length === 0) { _log("未找到前往按钮"); return "fail"; }
    var topGoBtn = gh.getMaxYPoint(goBtns);
    click(topGoBtn.x + imgs.shipGoBtn.getWidth() / 2, topGoBtn.y + imgs.shipGoBtn.getHeight() / 2);
    _log("点击前往按钮: (" + topGoBtn.x + ", " + topGoBtn.y + ")");
    sleep(2000);

    // 5. 点击舰队前往
    var fleetGo = gh.findFirst(imgs.fleetGo, 0.7, "舰队前往");
    if (!fleetGo) { _log("未找到舰队前往按钮"); return "fail"; }
    click(fleetGo.x + imgs.fleetGo.getWidth() / 2, fleetGo.y + imgs.fleetGo.getHeight() / 2);
    _log("点击舰队前往");
    sleep(2000);

    // 6. 勾选并出征
    var count = fleet.selectUnchecked(imgs);
    _log("已勾选 " + count + " 个舰队");
    sleep(500);
    if (fleet.dispatch(imgs)) {
        _log("出征成功");
        return "ok";
    }
    _log("未找到出征按钮");
    return "fail";
}

function msToNextHour() {
    var now = new Date();
    var next = new Date(now);
    next.setMinutes(0, 0, 0);
    next.setHours(next.getHours() + 1);
    return next.getTime() - now.getTime();
}

function waitToNextHour(shouldStop, _log) {
    var waitMs = msToNextHour();
    _log("等待下一个整点，剩余 " + Math.round(waitMs / 60000) + " 分钟");
    while (!shouldStop() && msToNextHour() > 3000) {
        sleep(5000);
    }
    if (shouldStop()) return true;
    _log("整点到达");
    sleep(5000);
    return false;
}

merchantShip.run = function(imgs, shouldStop, uiLog, mode, freq, onAction) {
    var navigate = require("./navigate.js");
    var _log = uiLog || function() { log.apply(null, arguments); };
    var interval = (freq && freq > 0) ? freq : 60;

    if (!imgs.shipIcon || !imgs.shipLarge || !imgs.shipInList || !imgs.shipGoBtn) {
        _log("搁浅商船图片未加载，跳过");
        return;
    }
    if (!imgs.fleetGo || !imgs.fleetUnchecked || !imgs.fleetDispatch) {
        _log("舰队图片未加载，跳过");
        return;
    }

    // 确保在世界界面
    var scene = navigate.detectScene(imgs);
    if (scene === "base") {
        var worldPos = gh.findFirst(imgs.worldIcon, 0.7, "世界图标");
        if (worldPos) {
            click(worldPos.x + imgs.worldIcon.getWidth() / 2, worldPos.y + imgs.worldIcon.getHeight() / 2);
            _log("切换到世界");
            sleep(3000);
        }
    } else if (scene === "unknown") {
        _log("未在游戏界面，任务取消");
        return;
    }

    _log("搁浅商船任务已启动 [" + (mode === "repeat" ? "持续模式" : "单次模式") + "] 8:00-22:00");

    while (!shouldStop()) {
        // 检测当前时间是否在 8:00-22:00 范围内
        var hour = new Date().getHours();
        if (hour < 8 || hour >= 22) {
            _log("当前不在运行时间 (8:00-22:00)，等待中...");
            for (var t = 0; t < 60 && !shouldStop(); t++) sleep(1000);
            continue;
        }

        // 检测是否有空闲舰队
        var idle = fleet.isIdle(imgs);
        if (!idle) {
            _log("无空闲舰队，等待中...");
            for (var i = 0; i < interval && !shouldStop(); i++) sleep(1000);
            continue;
        }

        _log("检测到空闲舰队，立即出征");
        sleep(1000);

        var result = runOnce(imgs, _log);

        if (result === "empty") {
            // 货轮不在列表，等下一个整点
            _log("等待下一个整点刷新...");
            if (waitToNextHour(shouldStop, _log)) return;
            continue;
        }

        if (result === "ok" && mode === "repeat") {
            // 持续模式：出征成功后继续监控空闲舰队
            _log("出征完成，持续监控空闲舰队...");
            if (onAction) onAction();
            while (!shouldStop()) {
                for (var j = 0; j < 60 && !shouldStop(); j++) sleep(1000);
                if (shouldStop()) return;

                var idleAgain = fleet.isIdle(imgs);
                if (idleAgain) {
                    _log("再次检测到空闲舰队，继续出征");
                    sleep(1000);
                    var r = runOnce(imgs, _log);
                    if (r === "ok") {
                        _log("再次出征成功，继续监控...");
                        if (onAction) onAction();
                    } else {
                        _log("本轮结束，等待下一个整点");
                        if (r === "empty" && waitToNextHour(shouldStop, _log)) return;
                        break;
                    }
                }
            }
        } else if (result === "ok" && mode === "once") {
            // 单次模式：出征成功，等下一个整点
            _log("单次出征完成，等待下一个整点");
            if (waitToNextHour(shouldStop, _log)) return;
        }
    }
};

// 整点商船：供种植/锻造任务调用，处理场景切换和执行一次商船
merchantShip.runHourlyOnce = function(imgs, _log, shouldStop) {
    var navigate = require("./navigate.js");

    if (!imgs.shipIcon || !imgs.shipLarge || !imgs.shipInList || !imgs.shipGoBtn) return false;
    if (!imgs.fleetGo || !imgs.fleetUnchecked || !imgs.fleetDispatch) return false;

    // 先检查时间，不在范围内直接跳过，不切换场景
    var hour = new Date().getHours();
    if (hour < 8 || hour >= 22) {
        _log("[商船] 不在运行时间 (8:00-22:00)，跳过");
        return false;
    }

    _log("[商船] 整点任务开始");
    if (shouldStop()) return false;

    // 检测当前界面
    var scene = navigate.detectScene(imgs);
    _log("[商船] 当前界面: " + (scene === "world" ? "世界" : scene === "base" ? "基地" : "未知"));
    if (scene === "unknown") { _log("[商船] 不在游戏主界面，跳过"); return false; }

    // 如果在基地，切换到世界
    var needBackToBase = (scene === "base");
    if (needBackToBase) {
        var worldPos = gh.findFirst(imgs.worldIcon, 0.7, "世界图标");
        if (!worldPos) { _log("[商船] 未找到世界图标，跳过"); return false; }
        click(worldPos.x + imgs.worldIcon.getWidth() / 2, worldPos.y + imgs.worldIcon.getHeight() / 2);
        _log("[商船] 切换到世界");
        sleep(3000);
        if (shouldStop()) return false;
    }

    // 检测空闲舰队
    var idle = fleet.isIdle(imgs);
    if (!idle) {
        _log("[商船] 无空闲舰队，跳过");
        if (needBackToBase) merchantShip._goBackToBase(imgs, _log);
        return false;
    }

    sleep(1000);
    if (shouldStop()) { if (needBackToBase) merchantShip._goBackToBase(imgs, _log); return false; }

    var result = runOnce(imgs, _log);
    _log("[商船] 结果: " + result);

    // 切回基地
    if (needBackToBase) {
        sleep(1000);
        merchantShip._goBackToBase(imgs, _log);
    }

    return result === "ok" || result === "empty";
};

merchantShip._goBackToBase = function(imgs, _log) {
    var basePos = gh.findFirst(imgs.baseIcon, 0.7, "基地图标");
    if (basePos) {
        click(basePos.x + imgs.baseIcon.getWidth() / 2, basePos.y + imgs.baseIcon.getHeight() / 2);
        _log("[商船] 切换回基地");
        sleep(3000);
    } else {
        _log("[商船] 未找到基地图标，无法切回");
    }
};

module.exports = merchantShip;
