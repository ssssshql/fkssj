// war.js — 盟战任务：集结/进攻/防守

var war = {};

var gh = require("./gameHelper.js");

// 执行一次完整出征流程，返回 true 表示成功
function runOnce(imgs, mode, _log) {
    var fleet = require("./fleet.js");

    // 1. 根据模式点击堡垒
    var targetImg;
    if (mode === "attack") {
        targetImg = imgs.fortAttack;
    } else if (mode === "defend") {
        targetImg = imgs.fortDefend;
    } else {
        _log("集结模式暂未开放");
        return false;
    }

    if (!targetImg) {
        _log("未加载堡垒图片");
        return false;
    }

    var pos = gh.findFirst(targetImg, 0.7);
    if (!pos) {
        _log("未找到" + (mode === "attack" ? "进攻" : "防御") + "堡垒");
        return false;
    }
    click(pos.x + targetImg.getWidth() / 2, pos.y + targetImg.getHeight() / 2);
    _log("点击" + (mode === "attack" ? "进攻" : "防御") + "堡垒: (" + pos.x + ", " + pos.y + ")");
    sleep(2000);

    // 2. 点击前往或进攻按钮
    var goImg = imgs.fleetGo;
    var attackImg = imgs.fleetAttack;
    var clicked = false;

    if (attackImg) {
        var aPos = gh.findFirst(attackImg, 0.7);
        if (aPos) {
            click(aPos.x + attackImg.getWidth() / 2, aPos.y + attackImg.getHeight() / 2);
            _log("点击进攻按钮: (" + aPos.x + ", " + aPos.y + ")");
            clicked = true;
        }
    }
    if (!clicked && goImg) {
        var gPos = gh.findFirst(goImg, 0.7);
        if (gPos) {
            click(gPos.x + goImg.getWidth() / 2, gPos.y + goImg.getHeight() / 2);
            _log("点击前往按钮: (" + gPos.x + ", " + gPos.y + ")");
            clicked = true;
        }
    }
    if (!clicked) {
        _log("未找到前往/进攻按钮");
        return false;
    }
    sleep(2000);

    // 3. 勾选并出征
    var count = fleet.selectUnchecked(imgs);
    _log("已勾选 " + count + " 支舰队");
    sleep(500);
    if (fleet.dispatch(imgs)) {
        _log("盟战出征成功");
        return true;
    }
    _log("未找到出征按钮");
    return false;
}

war.run = function(imgs, shouldStop, uiLog, mode) {
    var fleet = require("./fleet.js");
    var _log = uiLog || function(msg) { log(msg); };

    _log("盟战任务已启动 [模式: " + mode + "]");

    while (!shouldStop()) {
        // 检测空闲舰队
        var idle = fleet.isIdle(imgs);
        if (!idle) {
            _log("无空闲舰队，等待20s...");
            for (var i = 0; i < 20 && !shouldStop(); i++) sleep(1000);
            continue;
        }

        _log("检测到空闲舰队，开始出征");
        sleep(1000);

        var ok = runOnce(imgs, mode, _log);
        if (!ok) {
            _log("本轮出征失败，等待20s后重试");
        }

        for (var j = 0; j < 20 && !shouldStop(); j++) sleep(1000);
    }
};

module.exports = war;
