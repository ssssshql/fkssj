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
        // 锻造类型
        forgeTypeGun: images.read("./img/锻造/枪械未选中.png"),
        forgeTypeArmor: images.read("./img/锻造/防具未选中.png"),
        forgeTypeBlade: images.read("./img/锻造/兵刃未选中.png"),
        // 锻造级别
        forgeLevelBlue: images.read("./img/锻造/蓝级.png"),
        forgeLevelPurple: images.read("./img/锻造/紫级.png"),
        forgeLevelOrange: images.read("./img/锻造/橙级.png"),
        // 舰队
        fleetIdle: images.read("./img/舰队/空闲中.png"),
        fleetUnchecked: images.read("./img/舰队/未勾选.png"),
        fleetDispatch: images.read("./img/舰队/出征.png"),
        fleetGo: images.read("./img/舰队/前往.png"),
        fleetAttack: images.read("./img/舰队/进攻.png"),
        // 堡垒
        fortAttack: images.read("./img/堡垒/进攻堡垒.png"),
        fortDefend: images.read("./img/堡垒/防御堡垒.png"),
        fortRally: images.read("./img/盟战/集结.png"),
        // 盟战奖励
        warReward: images.read("./img/盟战/城战奖励.png"),
        warRewardExclaim: images.read("./img/盟战/感叹号.png"),
        warRewardItem: images.read("./img/盟战/奖励.png"),
        warRewardClose: images.read("./img/盟战/城战奖励关闭.png"),
        warRewardDone: images.read("./img/盟战/领取奖励完成.png"),
        // 搁浅商船
        shipIcon: images.read("./img/搁浅商船/图标.png"),
        shipLarge: images.read("./img/搁浅商船/万吨商轮.png"),
        shipInList: images.read("./img/搁浅商船/万吨货轮在列表.png"),
        shipGoBtn: images.read("./img/搁浅商船/前往按钮.png"),
        shipCloseList: images.read("./img/搁浅商船/关闭货轮列表.png"),
        shipClosePage: images.read("./img/搁浅商船/关闭搁浅商船页面.png"),
        // 通用导航
        baseIcon: images.read("./img/通用/基地.png"),
        worldIcon: images.read("./img/通用/世界.png"),
        forgeHouse: images.read("./img/通用/锻造屋.png"),
        forgeBack: images.read("./img/通用/锻造屋返回.png"),
        forgeSize: images.read("./img/通用/锻造屋大小.png")
    };
};

// 屏幕查找图片并点击中心 + 随机像素
gameHelper.findAndClick = function(targetImage, threshold, name) {
    if (typeof threshold === "string") { name = threshold; threshold = 0.7; }
    let screen = captureScreen();
    var result = images.findImage(screen, targetImage, {
        threshold: threshold || 0.7
    });
    var tag = name ? " [" + name + "]" : "";
    if (result) {
        console.log("找到图片" + tag + "，坐标：", result.x, result.y);
        click(
            result.x + targetImage.getWidth() / 2 + random(-10, 10),
            result.y + targetImage.getHeight() / 2 + random(-10, 10)
        );
        return true;
    } else {
        console.error("未找到图片" + tag);
        return false;
    }
};

// 屏幕查找图片并返回第一个坐标
gameHelper.findFirst = function(targetImage, threshold, name) {
    if (typeof threshold === "string") { name = threshold; threshold = 0.7; }
    let screen = captureScreen();
    var result = images.findImage(screen, targetImage, {
        threshold: threshold || 0.7
    });
    var tag = name ? " [" + name + "]" : "";
    if (result) {
        console.log("找到图片" + tag + "，坐标：", result.x, result.y);
        return {
            x: result.x,
            y: result.y
        };
    }
    console.error("未找到图片" + tag);
    return null;
};

// 在指定区域内查找图片并返回第一个坐标
gameHelper.findFirstInRegion = function(targetImage, x, y, w, h, threshold, name) {
    let screen = captureScreen();
    var regionX = Math.max(0, x);
    var regionY = Math.max(0, y);
    var result = images.findImage(screen, targetImage, {
        threshold: threshold || 0.7,
        region: [regionX, regionY, w, h]
    });
    var tag = name ? " [" + name + "]" : "";
    if (result) {
        console.log("区域内找到图片" + tag + "，坐标：", result.x, result.y);
        return { x: result.x, y: result.y };
    }
    console.error("区域内未找到图片" + tag);
    return null;
};

// 屏幕查找图片并返回所有坐标
gameHelper.findAll = function(targetImage, threshold, name) {
    if (typeof threshold === "string") { name = threshold; threshold = 0.7; }
    let screen = captureScreen();
    var result = images.matchTemplate(screen, targetImage, {
        threshold: threshold || 0.7,
        max: 20
    });
    var tag = name ? " [" + name + "]" : "";
    result.matches.forEach(function(match) {
        log("找到图片" + tag + " point=" + match.point + " similarity=" + match.similarity);
    });
    return result.matches.map(function(match) {
        return { x: match.point.x, y: match.point.y };
    });
};

// 屏幕查找图片并根据使用二值化过滤无效土地
gameHelper.findAllToFilter = function(targetImage, threshold, name, colorThreshold) {
    if (typeof threshold === "string") { name = threshold; threshold = 0.7; }
    let screen = captureScreen();
    var result = images.matchTemplate(screen, targetImage, {
        threshold: threshold || 0.7,
        max: 20
    });
    var tag = name ? " [" + name + "]" : "";
    let res = result.matches.filter(item=>{
        let tmp =  images.clip(screen, item.point.x, item.point.y, targetImage.getWidth(), targetImage.getHeight());
        let tmp2 = images.threshold(tmp, colorThreshold, 255);
        let isValid = !images.findColor(tmp2, "#000000");
        tmp.recycle();
        tmp2.recycle();
        if(isValid){
            console.log("检测到有效图片，保留 point=" + item.point + " similarity=" + item.similarity);
            return true;
        }else{
            console.log("检测到无效图片，过滤掉 point=" + item.point + " similarity=" + item.similarity);
            return false;
        }
    });


    res.forEach(function(match) {
        log("找到图片" + tag + " point=" + match.point + " similarity=" + match.similarity);
    });
    return res.map(item => {
        return { x: item.point.x, y: item.point.y };
    });;
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
        var resId = context.getResources().getIdentifier("status_bar_height", "dimen", "android");
        var statusBarH = context.getResources().getDimensionPixelSize(resId);

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
        var resId = context.getResources().getIdentifier("status_bar_height", "dimen", "android");
        var statusBarH = context.getResources().getDimensionPixelSize(resId);

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

// 双指向内收拢（缩小地图）
gameHelper.pinchZoomOut = function() {
    console.log("双指向内收拢（缩小地图）");
    var dm = context.getResources().getDisplayMetrics();
    var cx = Math.round(dm.widthPixels / 2);
    var cy = Math.round(dm.heightPixels / 2);
    gestures(
        [0, 800, [cx - 300, cy - 100], [cx - 50, cy]],
        [0, 800, [cx + 300, cy + 100], [cx + 50, cy]]
    );
};

// 查找最高点
gameHelper.getMaxYPoint = function(points) {
    var topMatch = points[0];
    for (var i = 1; i < points.length; i++) {
        if (points[i].y < topMatch.y) topMatch = points[i];
    }
    return topMatch;
};

// 获取真实物理分辨率 [width, height]
gameHelper.getRealResolution = function() {
    var wm = context.getSystemService(android.content.Context.WINDOW_SERVICE);
    var display = wm.getDefaultDisplay();
    var realDm = new android.util.DisplayMetrics();
    display.getRealMetrics(realDm);
    return [realDm.widthPixels, realDm.heightPixels];
};

// 应用列表权限
gameHelper.hasPackageListPerm = function() {
    try {
        return context.getPackageManager().getInstalledPackages(0).size() > 1;
    } catch(e) { return false; }
};

// 无障碍权限
gameHelper.hasAccessibilityPerm = function() {
    try {
        var accStr = android.provider.Settings.Secure.getString(
            context.getContentResolver(),
            android.provider.Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        );
        if (!accStr) return false;
        var lower = accStr.toLowerCase();
        var pkg = context.getPackageName().toLowerCase();
        return lower.indexOf(pkg) >= 0;
    } catch(e) { return false; }
};

// 后台弹出界面权限
gameHelper.hasBackgroundPopupPerm = function() {
    try {
        var appOps = context.getSystemService(android.content.Context.APP_OPS_SERVICE);
        var mode = appOps.checkOpNoThrow(
            android.app.AppOpsManager.OP_SYSTEM_ALERT_WINDOW,
            android.os.Process.myUid(),
            context.getPackageName()
        );
        return mode === android.app.AppOpsManager.MODE_ALLOWED;
    } catch(e) { return false; }
};

// 悬浮窗权限
gameHelper.hasOverlayPerm = function() {
    try {
        return android.provider.Settings.canDrawOverlays(context);
    } catch(e) { return false; }
};

module.exports = gameHelper;
