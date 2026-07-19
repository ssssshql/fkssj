// plantFood.js — 种食物：收割→翻地→播种，库存满自动切换作物

var plantFood = {};

plantFood.run = function(imgs, foodType, onProgress, shouldStop, uiLog, onFoodSwitch, freq, shipInFood, shipRunOnStart, onShipBack) {
    var gh = require("./gameHelper.js");
    var _log = uiLog || function(msg) { log(msg); };
    var interval = (freq && freq > 0) ? freq : 30;
    var runCount = 0;
    var cropImg = imgs.crops[foodType];
    var seedImg = imgs.seeds[foodType];
    if (!cropImg || !seedImg) {
        onProgress(0, "不支持的食物类型: " + foodType);
        return;
    }

    // 可切换的作物列表（不含当前）
    var allFoods = ["水稻", "玉米", "土豆", "西红柿", "胡萝卜", "卷心菜", "大豆"];
    var currentFood = foodType;
    var _lastShipHour = shipRunOnStart ? new Date().getHours() : -1;

    function switchToNextFood() {
        var idx = allFoods.indexOf(currentFood);
        for (var i = 1; i < allFoods.length; i++) {
            var next = allFoods[(idx + i) % allFoods.length];
            if (imgs.crops[next] && imgs.seeds[next]) {
                currentFood = next;
                cropImg = imgs.crops[next];
                seedImg = imgs.seeds[next];
                _log("自动切换作物: " + next);
                if (onFoodSwitch) onFoodSwitch(next);
                return next;
            }
        }
        // 所有作物都试过了，重置回第一个作物，等下一轮再试
        currentFood = allFoods[0];
        cropImg = imgs.crops[currentFood];
        seedImg = imgs.seeds[currentFood];
        _log("所有作物都已尝试，重置为 " + currentFood + "，等待下轮");
        return null;
    }

    function checkPlantResult(landImg, liandaoImg) {
        // 播种后检测 3 次空土地，间隔 1.5s
        for (var c = 0; c < 3; c++) {
            sleep(1500);
            var emptyLand = gh.findAll(landImg, 0.91, "土地");
            if (emptyLand.length === 0) return true; // 空土地没了，播种成功
        }
        // 3 次都有空土地 → 播种失败
        // 用 gesture 快速划到第一个空土地点，触发库存提示（单点，够快）
        var emptyLand = gh.findAll(landImg, 0.91, "土地");
        if (emptyLand.length > 0 && liandaoImg) {
            var liandaoPos = gh.findFirst(liandaoImg, 0.6, "镰刀");
            if (liandaoPos) {
                var ldx = liandaoPos.x + liandaoImg.getWidth() / 2 + Math.round(Math.random() * 6 - 3);
                var ldy = liandaoPos.y + liandaoImg.getHeight() / 2 + Math.round(Math.random() * 6 - 3);
                var tx = emptyLand[0].x + landImg.getWidth() / 2 + Math.round(Math.random() * 6 - 3);
                var ty = emptyLand[0].y + landImg.getHeight() * 1.5 + Math.round(Math.random() * 6 - 3);
                gesture(800, [ldx, ldy], [tx, ty]);
                sleep(1200);
            }
        }
        return false;
    }

    while (!shouldStop()) {
        // ===== 整点万吨商船 =====
        if (shipInFood) {
            var merchantShip = require("./merchantShip.js");
            var nowH = new Date().getHours();
            if (nowH !== _lastShipHour) {
                _log("[商船] 整点到达 (" + nowH + ":00)，执行一次");
                merchantShip.runHourlyOnce(imgs, _log, shouldStop);
                _lastShipHour = nowH;
                if (shouldStop()) return true;
                // 商船执行后需要重新定位到种植区
                if (onShipBack) {
                    _log("重新定位到种植区...");
                    if (!onShipBack()) {
                        _log("重新定位失败，等待下轮");
                        for (var s = 0; s < interval && !shouldStop(); s++) sleep(1000);
                        continue;
                    }
                }
            }
            if (shouldStop()) return true;
        }

        var didSomething = false;

        // ===== 收割 =====
        // 先检测当前作物，没有则轮询其他作物
        var foundCrop = null;
        var foundCropImg = null;
        var foundCropName = null;
        var cropsToTry = [currentFood].concat(allFoods.filter(function(f) { return f !== currentFood; }));
        for (var ci = 0; ci < cropsToTry.length; ci++) {
            var cname = cropsToTry[ci];
            var cimg = imgs.crops[cname];
            if (!cimg) continue;
            var matches = gh.findAll(cimg, 0.7, cname);
            if (matches.length > 0) {
                foundCrop = matches;
                foundCropImg = cimg;
                foundCropName = cname;
                gh.showOverlay(matches, cimg);
                break;
            }
        }
        if (foundCrop) {
            didSomething = true;
            // 收割后是否需要恢复原作物
            var switchedForHarvest = false;
            if (foundCropName !== currentFood) {
                _log("检测到成熟" + foundCropName + "，先收割");
                switchedForHarvest = true;
            }
            var topRice = gh.getMaxYPoint(foundCrop);
            click(topRice.x + foundCropImg.getWidth() / 2, topRice.y + foundCropImg.getHeight());
            _log("点击" + foundCropName + ": (" + topRice.x + ", " + topRice.y + ")");
            sleep(2000);

            var liandaoPos = gh.findFirst(imgs.liandao, 0.6, "镰刀");
            gh.showOverlay(liandaoPos, imgs.liandao);
            if (!liandaoPos) { _log("未找到镰刀"); }
            else {
                sleep(2000);
                foundCrop = gh.findAll(foundCropImg, 0.5, foundCropName);
                gh.showOverlay(foundCrop, foundCropImg);
                if (foundCrop.length === 0) { _log("收割前未找到" + foundCropName); }
                else {
                    var ldx = liandaoPos.x + imgs.liandao.getWidth() / 2 + Math.round(Math.random() * 10 - 5);
                    var ldy = liandaoPos.y + imgs.liandao.getHeight() / 2 + Math.round(Math.random() * 10 - 5);
                    var harvestPoints = foundCrop.map(function(p) {
                        return { x: p.x + foundCropImg.getWidth() / 2 + Math.round(Math.random() * 10 - 5),
                                 y: p.y + foundCropImg.getHeight() * 1.5 + Math.round(Math.random() * 10 - 5) };
                    }).sort(function(a, b) { return a.y - b.y; });
                    var gestureParams = [2000, [ldx, ldy]];
                    for (var i = 0; i < harvestPoints.length; i++) {
                        gestureParams.push([harvestPoints[i].x, harvestPoints[i].y]);
                    }
                    gesture.apply(null, gestureParams);
                    _log("收割完成，经过 " + harvestPoints.length + " 个" + foundCropName);
                }
            }
            // 收割完毕，恢复用户选中的作物用于后续播种
            if (switchedForHarvest) {
                currentFood = foodType;
                cropImg = imgs.crops[foodType];
                seedImg = imgs.seeds[foodType];
                _log("恢复播种作物: " + foodType);
            }
        } else {
            _log("未找到成熟" + currentFood + "，跳过收割");
        }

        sleep(3000);

        // ===== 翻地播种 =====
        var land = gh.findAll(imgs.tudi, 0.91, "土地");
        gh.showOverlay(land, imgs.tudi);
        if (land.length > 0) {
            didSomething = true;
            var topLand = gh.getMaxYPoint(land);
            click(topLand.x + imgs.tudi.getWidth() / 2, topLand.y + imgs.tudi.getHeight());
            _log("点击土地: (" + topLand.x + ", " + topLand.y + ")");
            sleep(2000);

            land = gh.findAll(imgs.tudi, 0.91, "土地");
            gh.showOverlay(land, imgs.tudi);
            if (land.length === 0) { _log("播种前未找到土地"); }
            else {
                sleep(2000);
                var seedPos = gh.findFirst(seedImg, 0.7, currentFood + "种子");
                gh.showOverlay(seedPos, seedImg);
                if (!seedPos) { _log("未找到" + currentFood + "种子"); }
                else {
                    _log("种子位置: (" + seedPos.x + ", " + seedPos.y + ")");
                    var sdx = seedPos.x + seedImg.getWidth() / 2 + Math.round(Math.random() * 10 - 5);
                    var sdy = seedPos.y + seedImg.getHeight() / 2 + Math.round(Math.random() * 10 - 5);
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

                    // 检测播种结果
                    var planted = checkPlantResult(imgs.tudi, imgs.liandao);
                    if (!planted) {
                        _log(currentFood + " 播种失败，尝试切换作物");
                        var fullPrompt = gh.findFirst(imgs.stockFull, 0.7, "库存已满");
                        if (fullPrompt) {
                            _log("确认: " + currentFood + " 库存已满");
                        }
                        var next = switchToNextFood();
                        if (next) {
                            onProgress(runCount, "已切换: " + next + "，立即重试播种");
                            continue;
                        } else {
                            _log("所有作物都已尝试，等待下轮");
                            onProgress(runCount, "所有作物都已尝试，等待中...");
                        }
                        sleep(2000);
                    }
                }
            }
        } else {
            _log("未找到空土地，跳过播种");
        }

        if (didSomething) {
            runCount++;
            onProgress(runCount, currentFood + " 完成 第 " + runCount + " 次");
            _log("等待作物成熟或空土地... " + interval + "秒后再检测");
        } else {
            onProgress(runCount, "等待作物成熟或空土地... " + interval + "秒后再检测");
            _log("未找到成熟作物或空土地，等待 " + interval + " 秒再检测");
        }

        for (var w = 0; w < interval; w++) {
            if (shouldStop()) return true;
            sleep(1000);
        }
        _log(interval + "秒到，重新检测");
    }

    return true;
};

module.exports = plantFood;
