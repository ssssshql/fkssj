// gameHelper.js
// 疯狂水世界辅助工具 - 核心逻辑模块

var gameHelper = {};

// 加载图片资源
gameHelper.loadImages = function() {
    return {
        // 作物成熟图
        crops: {
            "水稻": images.read("./img/作物/水稻.png"),
            "玉米": images.read("./img/作物/玉米.png"),
            "土豆": images.read("./img/作物/土豆.png"),
            "西红柿": images.read("./img/作物/西红柿.png"),
            "胡萝卜": images.read("./img/作物/胡萝卜.png"),
            "卷心菜": images.read("./img/作物/卷心菜.png"),
            "大豆": images.read("./img/作物/大豆.png"),
        },
        // 作物种子图标
        seeds: {
            "水稻": images.read("./img/种子图标/水稻.png"),
            "玉米": images.read("./img/种子图标/玉米.png"),
            "土豆": images.read("./img/种子图标/土豆.png"),
            "西红柿": images.read("./img/种子图标/西红柿.png"),
            "胡萝卜": images.read("./img/种子图标/胡萝卜.png"),
            "卷心菜": images.read("./img/种子图标/卷心菜.png"),
            "大豆": images.read("./img/种子图标/大豆.png"),
        },
        liandao: images.read("./img/镰刀.png"),
        tudi: images.read("./img/土地.png"),
        stockFull: images.read("./img/该农作物库存已达上限.png"),
        duanzao: images.read("./img/锻造/开始锻造.png"),
        duanzaoDone: images.read("./img/锻造/锻造完成.png"),
        // 舰队
        fleetIdle: images.read("./img/舰队/空闲中.png"),
        fleetUnchecked: images.read("./img/舰队/未勾选.png"),
        fleetDispatch: images.read("./img/舰队/出征.png"),
        fleetGo: images.read("./img/舰队/前往.png"),
        fleetAttack: images.read("./img/舰队/进攻.png"),
        // 堡垒
        fortAttack: images.read("./img/堡垒/进攻堡垒.png"),
        fortDefend: images.read("./img/堡垒/防御堡垒.png"),
        // 盟战奖励
        warReward: images.read("./img/盟战/城战奖励.png"),
        warRewardExclaim: images.read("./img/盟战/感叹号.png"),
        warRewardItem: images.read("./img/盟战/奖励.png"),
        warRewardClose: images.read("./img/盟战/城战奖励关闭.png"),
        // 搁浅商船
        shipIcon: images.read("./img/搁浅商船/图标.png"),
        shipLarge: images.read("./img/搁浅商船/万吨商轮.png"),
        shipInList: images.read("./img/搁浅商船/万吨货轮在列表.png"),
        shipGoBtn: images.read("./img/搁浅商船/前往按钮.png")
    };
};

// 屏幕查找图片并点击中心 + 随机像素
gameHelper.findAndClick = function(targetImage, threshold = 0.7) {
    let screen = captureScreen();
    var result = images.findImage(screen, targetImage, {
        threshold: threshold
    });
    if (result) {
        console.log("找到目标图片，坐标：", result.x, result.y);
        click(
            result.x + targetImage.getWidth() / 2 + random(-10, 10),
            result.y + targetImage.getHeight() / 2 + random(-10, 10)
        );
        return true;
    } else {
        console.error("未找到目标图片");
        return false;
    }
};

// 屏幕查找图片并返回第一个坐标
gameHelper.findFirst = function(targetImage, threshold = 0.7) {
    let screen = captureScreen();
    var result = images.findImage(screen, targetImage, {
        threshold: threshold
    });
    if (result) {
        console.log("找到目标图片，坐标：", result.x, result.y);
        return {
            x: result.x,
            y: result.y 
        };
    }
    console.error("未找到目标图片");
    return null;
};

// 在指定区域内查找图片并返回第一个坐标（坐标相对于原图）
gameHelper.findFirstInRegion = function(targetImage, x, y, w, h, threshold) {
    let screen = captureScreen();
    var regionX = Math.max(0, x);
    var regionY = Math.max(0, y);
    var result = images.findImage(screen, targetImage, {
        threshold: threshold || 0.7,
        region: [regionX, regionY, w, h]
    });
    if (result) {
        console.log("区域内找到目标图片，坐标：", result.x, result.y);
        return { x: result.x, y: result.y };
    }
    return null;
};

// 屏幕查找图片并返回所有坐标
gameHelper.findAll = function(targetImage, threshold = 0.7, max = 20) {
    let screen = captureScreen();
    var result = images.matchTemplate(screen, targetImage, {
        threshold,
        max
    });
    result.matches.forEach(match => {
        log("point = " + match.point + ", similarity = " + match.similarity);
    });
    return result.matches.map(match => ({
        x: match.point.x ,
        y: match.point.y
    }));
};

// 锻造：每隔30s检测开始锻造按钮，有则点击；检测到锻造完成则点屏幕边缘关闭
gameHelper.autoWeapon = function(loadedImages, shouldStop, uiLog) {
    var _log = uiLog || function() { console.log.apply(null, arguments); };
    if (!loadedImages) { _log("资源未加载，请先启动游戏"); return; }
    var targetImg = loadedImages.duanzao;
    var doneImg = loadedImages.duanzaoDone;
    if (!targetImg) { _log("锻造图片未加载"); return; }
    var dm = context.getResources().getDisplayMetrics();
    var sw = dm.widthPixels, sh = dm.heightPixels;
    _log("锻造任务已启动，每30s检测一次");
    while (!shouldStop()) {
        // 检测锻造完成弹窗，点边缘关闭
        if (doneImg) {
            var donePos = gameHelper.findFirst(doneImg, 0.7);
            if (donePos) {
                var edges = [
                    [random(20, 60), random(100, 200)],
                    [sw - random(20, 60), random(100, 200)],
                    [random(20, 60), sh - random(200, 400)],
                    [sw - random(20, 60), sh - random(200, 400)]
                ];
                var e = edges[random(0, edges.length - 1)];
                click(e[0], e[1]);
                _log("锻造完成，点击空白区域: (" + e[0] + ", " + e[1] + ")");
                sleep(2000);
            }
        }
        // 检测开始锻造
        var pos = gameHelper.findFirst(targetImg, 0.7);
        if (pos) {
            click(pos.x + targetImg.getWidth() / 2, pos.y + targetImg.getHeight() / 2);
            _log("点击开始锻造: (" + pos.x + ", " + pos.y + ")");
        }
        for (var i = 0; i < 30 && !shouldStop(); i++) sleep(1000);
    }
};

// 显示检测结果叠加层（非阻塞，1.5秒后自动消失）
gameHelper.showOverlay = function(matches, img) {
    if (!matches) return;
    if (!Array.isArray(matches)) matches = [matches];
    if (matches.length === 0) return;
    var imgW = img.getWidth(), imgH = img.getHeight();
    var overlay;
    $ui.run(function() {
        var boxColor = "#22c55e";
        var dm = context.getResources().getDisplayMetrics();
        var statusBarH = dm.heightPixels - 2279;

        overlay = floaty.rawWindow(
            <frame id="root" bg="#00000000">
                <canvas id="cv" w="*" h="*"/>
            </frame>
        );
        overlay.setSize(-1, -1);
        overlay.setPosition(0, 0);
        overlay.setTouchable(false);

        overlay.cv.on("draw", function(canvas) {
            canvas.drawARGB(0, 0, 0, 0);
            canvas.translate(0, -statusBarH);

            var boxPaint = new Paint();
            boxPaint.setAntiAlias(true);
            boxPaint.setStyle(Paint.Style.STROKE);
            boxPaint.setStrokeWidth(6);
            boxPaint.setColor(colors.parseColor(boxColor));

            var textPaint = new Paint();
            textPaint.setAntiAlias(true);
            textPaint.setTextSize(36);
            textPaint.setColor(colors.parseColor(boxColor));

            for (var i = 0; i < matches.length; i++) {
                var x = matches[i].x, y = matches[i].y;
                canvas.drawRect(x, y, x + imgW, y + imgH, boxPaint);
                canvas.drawText("#" + (i+1) + " (" + x + "," + y + ")", x, y - 8, textPaint);
            }
        });

        overlay.cv.invalidate();
    });
    // 异步关闭，不阻塞主流程
    threads.start(function() {
        sleep(1500);
        try { if (overlay) { overlay.close(); overlay = null; } } catch(e) {}
    });
};

// 显示矩形区域叠加层（非阻塞，1.5秒后自动消失）
// region: [x, y, w, h]，label: 可选文字标签，color: 可选颜色，默认橙色
gameHelper.showRegionOverlay = function(region, label, color) {
    if (!region || region.length < 4) return;
    var rx = region[0], ry = region[1], rw = region[2], rh = region[3];
    var boxColor = color || "#f97316";
    var overlay;
    $ui.run(function() {
        var dm = context.getResources().getDisplayMetrics();
        var statusBarH = dm.heightPixels - 2279;

        overlay = floaty.rawWindow(
            <frame id="root" bg="#00000000">
                <canvas id="cv" w="*" h="*"/>
            </frame>
        );
        overlay.setSize(-1, -1);
        overlay.setPosition(0, 0);
        overlay.setTouchable(false);

        overlay.cv.on("draw", function(canvas) {
            canvas.drawARGB(0, 0, 0, 0);
            canvas.translate(0, -statusBarH);

            var paint = new Paint();
            paint.setAntiAlias(true);
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(4);
            paint.setColor(colors.parseColor(boxColor));

            canvas.drawRect(rx, ry, rx + rw, ry + rh, paint);

            var textPaint = new Paint();
            textPaint.setAntiAlias(true);
            textPaint.setTextSize(32);
            textPaint.setColor(colors.parseColor(boxColor));

            var lbl = label || ("Region [" + rx + "," + ry + "," + rw + "," + rh + "]");
            canvas.drawText(lbl, rx + 4, ry - 6, textPaint);
        });

        overlay.cv.invalidate();
    });
    threads.start(function() {
        sleep(1500);
        try { if (overlay) { overlay.close(); overlay = null; } } catch(e) {}
    });
};

// 查找最高点
gameHelper.getMaxYPoint = function(points) {
    var topMatch = points[0];
    for (var i = 1; i < points.length; i++) {
        if (points[i].y < topMatch.y) topMatch = points[i];
    }
    return topMatch;
};

module.exports = gameHelper;
