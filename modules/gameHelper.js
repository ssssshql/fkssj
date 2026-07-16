// gameHelper.js
// 疯狂水世界辅助工具 - 核心逻辑模块

var gameHelper = {};

// 加载图片资源
gameHelper.loadImages = function() {
    return {
        // 作物成熟图
        crops: {
            "水稻": images.read("./img/水稻.png"),
            "玉米": images.read("./img/玉米.png"),
        },
        // 作物种子图标
        seeds: {
            "水稻": images.read("./img/种子图标/水稻.png"),
            "玉米": images.read("./img/种子图标/玉米.png"),
        },
        liandao: images.read("./img/镰刀.png"),
        tudi: images.read("./img/土地.png")
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
            result.x + targetImage.getWidth(),
            result.y + targetImage.getHeight()
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

// 自动打武器（待实现）
gameHelper.autoWeapon = function(images) {
    console.log("打武器功能待实现");
    sleep(2000);
    return true;
};

// 自动盟战（待实现）
gameHelper.autoWar = function(images) {
    console.log("盟战功能待实现");
    sleep(2000);
    return true;
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

// 查找最高点
gameHelper.getMaxYPoint = function(points) {
    var topMatch = points[0];
    for (var i = 1; i < points.length; i++) {
        if (points[i].y < topMatch.y) topMatch = points[i];
    }
    return topMatch;
};

module.exports = gameHelper;
