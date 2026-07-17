// war.js — 盟战任务：集结/进攻/防守

var war = {};

var gh = require("./gameHelper.js");

// 检查并领取盟战奖励，返回 true 表示有奖励已领取
function checkReward(imgs, _log) {
    if (!imgs.warReward || !imgs.warRewardExclaim || !imgs.warRewardItem || !imgs.warRewardClose) {
        return false;
    }

    // 找到"城战奖励"按钮位置
    var rewardPos = gh.findFirst(imgs.warReward, 0.7);
    if (!rewardPos) return false;

    var rw = imgs.warReward.getWidth();
    var rh = imgs.warReward.getHeight();

    // 在按钮上方查找感叹号，左右各扩展 1/4 宽度（因截图不全）
    var expand = Math.floor(rw / 4);
    var regionX = Math.max(0, rewardPos.x - expand);
    var regionW = rw + expand * 2;
    var regionY = Math.max(0, rewardPos.y - 200);
    var regionH = 200;

    var exclaimPos = gh.findFirstInRegion(imgs.warRewardExclaim, regionX, regionY, regionW, regionH, 0.7);
    if (!exclaimPos) return false;

    _log("检测到城战奖励感叹号，开始领取");

    // 点击"城战奖励"按钮中间 + 随机偏移
    click(rewardPos.x + rw / 2 + random(-10, 10), rewardPos.y + rh / 2 + random(-10, 10));
    _log("点击城战奖励");
    sleep(2000);

    // 找到所有奖励图片，点击最右边那个
    var rewards = gh.findAll(imgs.warRewardItem, 0.7);
    if (rewards.length > 0) {
        var rightmost = rewards[0];
        for (var i = 1; i < rewards.length; i++) {
            if (rewards[i].x > rightmost.x) rightmost = rewards[i];
        }
        var iw = imgs.warRewardItem.getWidth();
        var ih = imgs.warRewardItem.getHeight();
        click(rightmost.x + iw / 2 + random(-10, 10), rightmost.y + ih / 2 + random(-10, 10));
        _log("点击最右边奖励");
        sleep(1500);
    }

    // 点击关闭按钮
    var closePos = gh.findFirst(imgs.warRewardClose, 0.7);
    if (closePos) {
        var cw = imgs.warRewardClose.getWidth();
        var ch = imgs.warRewardClose.getHeight();
        click(closePos.x + cw / 2 + random(-10, 10), closePos.y + ch / 2 + random(-10, 10));
        _log("关闭城战奖励面板");
        sleep(1000);
    }

    return true;
}

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
        // 检查并领取盟战奖励
        if (checkReward(imgs, _log)) {
            _log("奖励领取完毕，继续检测...");
            sleep(1000);
            continue;
        }

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
