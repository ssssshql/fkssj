// plantFood.js
// 种食物：每30秒检测水稻，有则执行收割→翻地→播种，无则继续等待

var plantFood = {};

// 轮询主循环，onProgress(count, msg) 用于 UI 更新，shouldStop() 返回 true 则停止
plantFood.run = function(imgs, foodType, onProgress, shouldStop, uiLog) {
    var gh = require("./gameHelper.js");
    var _log = uiLog || function() { log.apply(null, arguments); };
    var runCount = 0;
    var cropImg = imgs.crops[foodType];
    var seedImg = imgs.seeds[foodType];
    if (!cropImg || !seedImg) {
        onProgress(0, "不支持的食物类型: " + foodType);
        return;
    }

    while (!shouldStop()) {
        var didSomething = false;

        // ===== 有成熟作物：收割 =====
        var rice = gh.findAll(cropImg, 0.7);
        if (rice.length > 0) {
            didSomething = true;
            // 点击成熟作物
            var topRice = gh.getMaxYPoint(rice);
            click(topRice.x + cropImg.getWidth() / 2, topRice.y + cropImg.getHeight());
            _log("点击" + foodType + ": (" + topRice.x + ", " + topRice.y + ")");
            sleep(2000);

            // 识别镰刀
            var liandaoPos = gh.findFirst(imgs.liandao, 0.6);
            if (!liandaoPos) { _log("未找到镰刀"); }
            else {
                sleep(2000);
                // 重新查找作物，从上往下收割
                rice = gh.findAll(cropImg, 0.5);
                if (rice.length === 0) { _log("收割前未找到" + foodType); }
                else {
                    var ldx = liandaoPos.x + imgs.liandao.getWidth() / 2 + Math.round(Math.random() * 10 - 5);
                    var ldy = liandaoPos.y + imgs.liandao.getHeight() / 2 + Math.round(Math.random() * 10 - 5);
                    var harvestPoints = rice.map(function(p) {
                        return { x: p.x + cropImg.getWidth() / 2 + Math.round(Math.random() * 10 - 5),
                                 y: p.y + cropImg.getHeight() * 1.5 + Math.round(Math.random() * 10 - 5) };
                    }).sort(function(a, b) { return a.y - b.y; });
                    var gestureParams = [2000, [ldx, ldy]];
                    for (var i = 0; i < harvestPoints.length; i++) {
                        gestureParams.push([harvestPoints[i].x, harvestPoints[i].y]);
                    }
                    gesture.apply(null, gestureParams);
                    _log("收割完成，经过 " + harvestPoints.length + " 个" + foodType);
                }
            }
        }else{
            _log("未找到成熟" + foodType + "，跳过收割");
        }

        // 收割动画缓冲
        sleep(3000);

        // ===== 有空土地：翻地播种 =====
        var land = gh.findAll(imgs.tudi, 0.91);
        gh.showOverlay(land, imgs.tudi);
        if (land.length > 0) {
            didSomething = true;
            var topLand = gh.getMaxYPoint(land);
            click(topLand.x + imgs.tudi.getWidth() / 2, topLand.y + imgs.tudi.getHeight());
            _log("点击土地: (" + topLand.x + ", " + topLand.y + ")");
            sleep(2000);

            land = gh.findAll(imgs.tudi, 0.91);
            gh.showOverlay(land, imgs.tudi);
            if (land.length === 0) { _log("播种前未找到土地"); }
            else {
                sleep(2000);
                var seedPos = gh.findFirst(seedImg, 0.7);
                gh.showOverlay(seedPos, seedImg);
                if (!seedPos) { _log("未找到" + foodType + "种子"); }
                else {
                    _log("种子位置: (" + seedPos.x + ", " + seedPos.y + ")");
                    var sdx = seedPos.x + seedImg.getWidth() / 2 + Math.round(Math.random() * 10 - 5);
                    var sdy = seedPos.y + seedImg.getHeight() / 2 + Math.round(Math.random() * 10 - 5);
                    _log("播种起点: (" + sdx + ", " + sdy + ")");
                    var plantPoints = land.map(function(p) {
                        return { x: p.x + imgs.tudi.getWidth() / 2 + Math.round(Math.random() * 10 - 5),
                                 y: p.y + imgs.tudi.getHeight() * 1.5 + Math.round(Math.random() * 10 - 5) };
                    }).sort(function(a, b) { return a.y - b.y; });
                    gestureParams = [2000, [sdx, sdy]];
                    for (var j = 0; j < plantPoints.length; j++) {
                        gestureParams.push([plantPoints[j].x, plantPoints[j].y]);
                    }
                    gesture.apply(null, gestureParams);
                    _log("播种完成，经过 " + plantPoints.length + " 块土地");
                }
            }
        }else{
            _log("未找到空土地，跳过播种");
        }

        if (didSomething) {
            runCount++;
            onProgress(runCount, foodType + " 完成 第 " + runCount + " 次");
            _log("等待作物成熟或空土地... 30秒后再检测");
        } else {
            onProgress(runCount, "等待作物成熟或空土地... 30秒后再检测");
            _log("未找到成熟作物或空土地，等待 30 秒再检测");
        }

        // 等 30 秒再检测
        for (var w = 0; w < 6; w++) {
            if (shouldStop()) return true;
            sleep(5000);
        }
        _log("30秒到，重新检测");
    }

    return true;
};

module.exports = plantFood;
