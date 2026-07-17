// fleet.js — 舰队通用操作，供各任务模块复用

var fleet = {};

var gh = require("./gameHelper.js");

fleet.isIdle = function(imgs, threshold) {
    var pos = gh.findFirst(imgs.fleetIdle, threshold || 0.7);
    if (pos) console.log("检测到空闲舰队: (" + pos.x + ", " + pos.y + ")");
    return pos;
};

fleet.selectUnchecked = function(imgs, threshold) {
    var unchecked = gh.findAll(imgs.fleetUnchecked, threshold || 0.7);
    console.log("未勾选舰队: " + unchecked.length + " 个");
    for (var i = 0; i < unchecked.length; i++) {
        var p = unchecked[i];
        console.log("勾选第 " + (i+1) + " 个: (" + p.x + ", " + p.y + ")");
        click(p.x + imgs.fleetUnchecked.getWidth() / 2, p.y + imgs.fleetUnchecked.getHeight() / 2);
        sleep(500);
    }
    return unchecked.length;
};

fleet.dispatch = function(imgs, threshold) {
    var pos = gh.findFirst(imgs.fleetDispatch, threshold || 0.7);
    if (pos) {
        console.log("出征按钮位置: (" + pos.x + ", " + pos.y + ")");
        click(pos.x + imgs.fleetDispatch.getWidth() / 2, pos.y + imgs.fleetDispatch.getHeight() / 2);
        return true;
    }
    console.log("未找到出征按钮");
    return false;
};

module.exports = fleet;
