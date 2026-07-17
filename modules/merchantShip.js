// merchantShip.js — 搁浅商船任务

var merchantShip = {};

function runOnce(imgs, _log) {
    var gh = require("./gameHelper.js");
    var fleet = require("./fleet.js");

    // 1. 点击搁浅商船图标
    var iconPos = gh.findFirst(imgs.shipIcon, 0.7);
    if (!iconPos) { _log("未找到商船图标"); return "fail"; }
    click(iconPos.x + imgs.shipIcon.getWidth() / 2, iconPos.y + imgs.shipIcon.getHeight() / 2);
    _log("点击商船图标");
    sleep(2000);

    // 2. 点击万吨商轮
    var largePos = gh.findFirst(imgs.shipLarge, 0.7);
    if (!largePos) { _log("未找到万吨商轮"); return "fail"; }
    click(largePos.x + imgs.shipLarge.getWidth() / 2, largePos.y + imgs.shipLarge.getHeight() / 2);
    _log("点击万吨商轮");
    sleep(2000);

    // 3. 检测万吨货轮是否在列表
    var inList = gh.findFirst(imgs.shipInList, 0.7);
    if (!inList) {
        _log("货轮不在列表，本轮已打完");
        return "empty";
    }
    _log("货轮在列表中，准备前往");
    sleep(1000);

    // 4. 点击前往按钮
    var goBtn = gh.findFirst(imgs.shipGoBtn, 0.7);
    if (!goBtn) { _log("未找到前往按钮"); return "fail"; }
    click(goBtn.x + imgs.shipGoBtn.getWidth() / 2, goBtn.y + imgs.shipGoBtn.getHeight() / 2);
    _log("点击前往按钮");
    sleep(2000);

    // 5. 点击舰队前往
    var fleetGo = gh.findFirst(imgs.fleetGo, 0.7);
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

merchantShip.run = function(imgs, shouldStop, uiLog, mode) {
    var fleet = require("./fleet.js");
    var _log = uiLog || function() { log.apply(null, arguments); };

    if (!imgs.shipIcon || !imgs.shipLarge || !imgs.shipInList || !imgs.shipGoBtn) {
        _log("搁浅商船图片未加载，跳过");
        return;
    }
    if (!imgs.fleetGo || !imgs.fleetUnchecked || !imgs.fleetDispatch) {
        _log("舰队图片未加载，跳过");
        return;
    }

    _log("搁浅商船任务已启动 [" + (mode === "repeat" ? "持续模式" : "单次模式") + "]");

    while (!shouldStop()) {
        // 检测是否有空闲舰队
        var idle = fleet.isIdle(imgs);
        if (!idle) {
            _log("无空闲舰队，等待中...");
            for (var i = 0; i < 15 && !shouldStop(); i++) sleep(1000);
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

module.exports = merchantShip;
