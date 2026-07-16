// @ts-nocheck
"ui";

var gameHelper = require("./modules/gameHelper.js");
var plantFood = require("./modules/plantFood.js");

var floatWin = null;
var loadedImages = null;
var currentTask = null;
var currentTab = "food";
var runCount = 0;
var startTime = 0;
var icoBitmap = images.read("./ico.png").getBitmap();
var logEntries = [];

var harvestStats = { rice: 0, corn: 0, weapon: 0, war: 0 };

function dp(v) { return Math.round(v * context.getResources().getDisplayMetrics().density); }
function timeStr(d) { return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0') + ':' + String(d.getSeconds()).padStart(2,'0'); }
function dateStr(d) { return (d.getMonth()+1) + '/' + d.getDate() + ' ' + timeStr(d); }

// ── Light Theme ──
var C = {
    primary: "#6750A4",
    onPrimary: "#FFFFFF",
    onSurface: "#1D1B20",
    onSurfaceVariant: "#49454F",
    outline: "#79747E",
    outlineLight: "#E0DCE6",
    error: "#B3261E",
    success: "#386A20"
};

$ui.layout(
    <ScrollView id="main_scroll" layout_width="match_parent" layout_height="match_parent">
        <vertical layout_width="match_parent" padding="0 0 0 28">

            {/* ── Hero (transparent, gradient shows through) ── */}
            <vertical gravity="center_horizontal" padding="44 40 36 40">
                <frame w="76" h="76" margin="0 0 14 0">
                    <ImageView id="ico_view" scaleType="centerCrop" layout_width="match_parent" layout_height="match_parent"/>
                </frame>
                <text text="疯狂水世界" textColor="#FFFFFF" textSize="22sp" textStyle="bold" letterSpacing="2"/>
                <text text="辅助工具 v1.0" textColor="#C9B8E8" textSize="11sp" letterSpacing="1.5" margin="0 4 0 0"/>
            </vertical>

            {/* ── Content area ── */}
            <vertical padding="16 0 16 0">

                {/* ── Status + Launch ── */}
                <horizontal margin="0 0 0 12">
                    <card w="0" layout_weight="1" h="auto" cardCornerRadius="20dp" cardElevation="0dp"
                          cardBackgroundColor="#FEFEFE" margin="0 0 6 0">
                        <vertical padding="16 14">
                            <horizontal gravity="center_vertical" margin="0 0 0 8">
                                <frame id="status_dot" w="8" h="8" bg={C.outlineLight} margin="0 8 0 0"/>
                                <text id="status_label" text="就绪" textColor={C.outline} textSize="13sp"/>
                            </horizontal>
                            <text id="txt_time" text="00:00:00" textColor={C.onSurfaceVariant} textSize="22sp"
                                  typeface="monospace" textStyle="bold" letterSpacing="-0.5"/>
                        </vertical>
                    </card>
                    <card id="btn_launch" w="0" layout_weight="1" h="auto" cardCornerRadius="20dp" cardElevation="0dp"
                          cardBackgroundColor={C.primary} margin="6 0 0 0"
                          foreground="?selectableItemBackground">
                        <vertical gravity="center" padding="14 16">
                            <text text="&#9654;" textColor={C.onPrimary} textSize="22sp" gravity="center"
                                  textStyle="bold" margin="0 0 6 0"/>
                            <text text="启动游戏" textColor={C.onPrimary} textSize="15sp" textStyle="bold"
                                  gravity="center" letterSpacing="0.8"/>
                        </vertical>
                    </card>
                </horizontal>

                {/* ── Stats 2x2 ── */}
                <card w="*" cardCornerRadius="22dp" cardElevation="0dp"
                      cardBackgroundColor="#FEFEFE" margin="0 0 12 0">
                    <vertical padding="20 16">
                        <text text="今日收获" textColor={C.onSurfaceVariant} textSize="11sp" textStyle="bold"
                              letterSpacing="1.5" margin="0 0 14 0"/>
                        <horizontal margin="0 0 0 12">
                            <vertical layout_weight="1" gravity="center_horizontal">
                                <text id="stat_rice" text="0" textColor={C.primary} textSize="32sp" textStyle="bold" letterSpacing="-1"/>
                                <View bg={C.primary} w="18" h="3" margin="0 5 0 0"/>
                                <text text="水稻" textColor={C.outline} textSize="11sp" margin="0 2 0 0"/>
                            </vertical>
                            <vertical layout_weight="1" gravity="center_horizontal">
                                <text id="stat_corn" text="0" textColor={C.primary} textSize="32sp" textStyle="bold" letterSpacing="-1"/>
                                <View bg={C.primary} w="18" h="3" margin="0 5 0 0"/>
                                <text text="玉米" textColor={C.outline} textSize="11sp" margin="0 2 0 0"/>
                            </vertical>
                        </horizontal>
                        <horizontal>
                            <vertical layout_weight="1" gravity="center_horizontal">
                                <text id="stat_weapon" text="0" textColor={C.primary} textSize="32sp" textStyle="bold" letterSpacing="-1"/>
                                <View bg={C.primary} w="18" h="3" margin="0 5 0 0"/>
                                <text text="锻造" textColor={C.outline} textSize="11sp" margin="0 2 0 0"/>
                            </vertical>
                            <vertical layout_weight="1" gravity="center_horizontal">
                                <text id="stat_war" text="0" textColor={C.primary} textSize="32sp" textStyle="bold" letterSpacing="-1"/>
                                <View bg={C.primary} w="18" h="3" margin="0 5 0 0"/>
                                <text text="盟战" textColor={C.outline} textSize="11sp" margin="0 2 0 0"/>
                            </vertical>
                        </horizontal>
                    </vertical>
                </card>

                {/* ── Redeem + Log ── */}
                <horizontal>
                    <card w="0" layout_weight="1" h="auto" cardCornerRadius="22dp" cardElevation="0dp"
                          cardBackgroundColor="#FEFEFE" margin="0 0 6 0">
                        <vertical padding="16 14">
                            <text text="兑换码" textColor={C.onSurfaceVariant} textSize="11sp" textStyle="bold"
                                  letterSpacing="1.5" margin="0 0 10 0"/>

                            <horizontal gravity="center_vertical">
                                <vertical layout_weight="1">
                                    <text id="redeem_code_0" text="" textColor={C.onSurface} textSize="13sp" typeface="monospace" textStyle="bold"/>
                                    <text id="redeem_desc_0" text="" textColor={C.outline} textSize="10sp" margin="0 2 0 0"/>
                                </vertical>
                                <text id="redeem_copy_0" text="复制" textColor={C.primary} textSize="11sp"
                                      margin="6 0 0 0" foreground="?selectableItemBackground" padding="4 2"/>
                            </horizontal>
                            <text id="redeem_time_0" text="" textColor={C.outlineLight} textSize="9sp" typeface="monospace" margin="0 2 0 0"/>

                            <View bg={C.outlineLight} h="1" w="*" margin="0 8"/>

                            <horizontal gravity="center_vertical">
                                <vertical layout_weight="1">
                                    <text id="redeem_code_1" text="" textColor={C.onSurface} textSize="13sp" typeface="monospace" textStyle="bold"/>
                                    <text id="redeem_desc_1" text="" textColor={C.outline} textSize="10sp" margin="0 2 0 0"/>
                                </vertical>
                                <text id="redeem_copy_1" text="复制" textColor={C.primary} textSize="11sp"
                                      margin="6 0 0 0" foreground="?selectableItemBackground" padding="4 2"/>
                            </horizontal>
                            <text id="redeem_time_1" text="" textColor={C.outlineLight} textSize="9sp" typeface="monospace" margin="0 2 0 0"/>

                            <View bg={C.outlineLight} h="1" w="*" margin="0 8"/>

                            <horizontal gravity="center_vertical">
                                <vertical layout_weight="1">
                                    <text id="redeem_code_2" text="" textColor={C.onSurface} textSize="13sp" typeface="monospace" textStyle="bold"/>
                                    <text id="redeem_desc_2" text="" textColor={C.outline} textSize="10sp" margin="0 2 0 0"/>
                                </vertical>
                                <text id="redeem_copy_2" text="复制" textColor={C.primary} textSize="11sp"
                                      margin="6 0 0 0" foreground="?selectableItemBackground" padding="4 2"/>
                            </horizontal>
                            <text id="redeem_time_2" text="" textColor={C.outlineLight} textSize="9sp" typeface="monospace" margin="0 2 0 0"/>
                        </vertical>
                    </card>
                    <card w="0" layout_weight="1" h="auto" cardCornerRadius="22dp" cardElevation="0dp"
                          cardBackgroundColor="#FEFEFE" margin="6 0 0 0">
                        <vertical padding="16 14">
                            <text text="日志" textColor={C.onSurfaceVariant} textSize="11sp" textStyle="bold"
                                  letterSpacing="1.5" margin="0 0 8 0"/>
                            <ScrollView id="log_scroll" h="200" padding="0 0">
                                <text id="txt_log" text="等待操作..." textColor={C.outline} textSize="10sp"
                                      typeface="monospace" lineSpacingMultiplier="1.7"/>
                            </ScrollView>
                        </vertical>
                    </card>
                </horizontal>

            </vertical>
        </vertical>
    </ScrollView>
);

// ── 设置渐变背景 ──
(function() {
    var gd = new android.graphics.drawable.GradientDrawable(
        android.graphics.drawable.GradientDrawable.Orientation.TOP_BOTTOM,
        [colors.parseColor("#5B3FA0"), colors.parseColor("#8B6FC0"), colors.parseColor("#F3F0EB")]
    );
    $ui.main_scroll.setBackground(gd);
    $ui.main_scroll.setOverScrollMode(android.view.View.OVER_SCROLL_NEVER);
})();

// ── 圆形裁剪图标 ──
(function() {
    try {
        var iv = $ui.ico_view;
        iv.post(function() {
            var size = iv.getWidth();
            if (!size) return;
            var src = icoBitmap;
            var output = android.graphics.Bitmap.createBitmap(size, size, android.graphics.Bitmap.Config.ARGB_8888);
            var canvas = new android.graphics.Canvas(output);
            var paint = new Paint();
            paint.setAntiAlias(true);
            var shader = new android.graphics.BitmapShader(src, android.graphics.Shader.TileMode.CLAMP, android.graphics.Shader.TileMode.CLAMP);
            var matrix = new android.graphics.Matrix();
            var scale = Math.max(size / src.getWidth(), size / src.getHeight());
            matrix.setScale(scale, scale);
            var dx = (size - src.getWidth() * scale) / 2;
            var dy = (size - src.getHeight() * scale) / 2;
            matrix.postTranslate(dx, dy);
            shader.setLocalMatrix(matrix);
            paint.setShader(shader);
            canvas.drawCircle(size / 2, size / 2, size / 2, paint);
            iv.setImageBitmap(output);
        });
    } catch(e) {}
})();

// 加载图标
try { $ui.ico_view.setImageBitmap(icoBitmap); } catch(e) {}

$ui.statusBarColor("#5B3FA0");
$ui.navigationBarColor && $ui.navigationBarColor("#F3F0EB");
$ui.main_scroll.setOverScrollMode(android.view.View.OVER_SCROLL_NEVER);

// ===== 兑换码 =====
var redeemCodes = [
    { code: "WATER2026VIP", desc: "钻石 x100", time: new Date(2026, 6, 17, 9, 30) },
    { code: "FARM888", desc: "金币 x5000", time: new Date(2026, 6, 17, 10, 15) },
    { code: "CROP666", desc: "种子礼包", time: new Date(2026, 6, 16, 20, 0) }
];

(function() {
    for (var i = 0; i < redeemCodes.length; i++) {
        (function(idx) {
            var rc = redeemCodes[idx];
            $ui["redeem_code_" + idx].setText(rc.code);
            $ui["redeem_desc_" + idx].setText(rc.desc);
            $ui["redeem_time_" + idx].setText(dateStr(rc.time));
            $ui["redeem_copy_" + idx].on("click", function() {
                setClip(rc.code);
                toast("已复制: " + rc.code);
            });
        })(i);
    }
})();

// ===== 日志系统 =====
function appendLog(msg) {
    var line = timeStr(new Date()) + "  " + msg;
    logEntries.push(line);
    if (logEntries.length > 30) logEntries.shift();
    $ui.run(function() {
        try {
            $ui.txt_log.setText(logEntries.join("\n"));
            $ui.post(function() { $ui.log_scroll.fullScroll(android.view.View.FOCUS_DOWN); });
        } catch(e) {}
    });
}

function updateStats(c) {
    $ui.run(function() {
        if (c !== undefined) {
            if (currentTab === "food") {
                if (selectedFood === "水稻") { harvestStats.rice = c; $ui.stat_rice.setText(String(c)); }
                else if (selectedFood === "玉米") { harvestStats.corn = c; $ui.stat_corn.setText(String(c)); }
            } else if (currentTab === "weapon") {
                harvestStats.weapon = c; $ui.stat_weapon.setText(String(c));
            } else if (currentTab === "war") {
                harvestStats.war = c; $ui.stat_war.setText(String(c));
            }
        }
    });
}
function updateTime() {
    if (!currentTask) return;
    var e = Date.now() - startTime;
    var t = String(Math.floor(e/3600000)%24).padStart(2,'0') + ':' + String(Math.floor(e/60000)%60).padStart(2,'0') + ':' + String(Math.floor(e/1000)%60).padStart(2,'0');
    try { $ui.txt_time.setText(t); } catch(e) {}
}

function setStatusUI(text, color) {
    $ui.run(function() {
        try {
            $ui.status_dot.setBackgroundColor(colors.parseColor(color));
            $ui.status_label.setText(text);
            $ui.status_label.setTextColor(colors.parseColor(color));
        } catch(e) {}
    });
}

// ===== 悬浮球 =====
function showBall() {
    closeFloat();
    var sz = dp(44), pad = dp(8), total = sz + pad * 2, half = total / 2, r = sz / 2;
    floatWin = floaty.rawWindow(
        <frame id="root" bg="#00000000">
            <canvas id="cv" w={total} h={total}/>
        </frame>
    );
    floatWin.setSize(total, total);
    floatWin.cv.on("draw", function(canvas) {
        var p = new Paint();
        p.setAntiAlias(true);
        var glowColor = currentTask ? "#44EF5350" : "#446750A4";
        var glowColor2 = currentTask ? "#22EF5350" : "#226750A4";
        var ringColor = currentTask ? "#88EF5350" : "#886750A4";
        p.setStyle(Paint.Style.FILL);
        p.setColor(colors.parseColor(glowColor));
        canvas.drawCircle(half, half, half, p);
        p.setColor(colors.parseColor(glowColor2));
        canvas.drawCircle(half, half, half, p);
        p.setStyle(Paint.Style.STROKE);
        p.setStrokeWidth(dp(1.5));
        p.setColor(colors.parseColor(ringColor));
        canvas.drawCircle(half, half, r, p);
        p.setStyle(Paint.Style.FILL);
        canvas.saveLayer(0, 0, total, total, null, android.graphics.Canvas.ALL_SAVE_FLAG);
        p.setColor(colors.parseColor("#FFFFFFFF"));
        canvas.drawCircle(half, half, r, p);
        p.setXfermode(new android.graphics.PorterDuffXfermode(android.graphics.PorterDuff.Mode.SRC_IN));
        var src = new android.graphics.Rect(0, 0, icoBitmap.getWidth(), icoBitmap.getHeight());
        var dst = new android.graphics.Rect(pad, pad, pad + sz, pad + sz);
        canvas.drawBitmap(icoBitmap, src, dst, p);
        p.setXfermode(null);
        canvas.restore();
    });
    floatWin.cv.invalidate();
    var dm = context.getResources().getDisplayMetrics();
    floatWin.setPosition(dm.widthPixels - total - dp(6), dp(74));
    var tx, ty, wx, wy, moved;
    floatWin.root.setOnTouchListener(function(v, e) {
        switch(e.getAction()) {
            case 0: tx = e.getRawX(); ty = e.getRawY(); wx = floatWin.getX(); wy = floatWin.getY(); moved = false; break;
            case 2: if (Math.abs(e.getRawX()-tx) > 8 || Math.abs(e.getRawY()-ty) > 8) moved = true; floatWin.setPosition(wx + (e.getRawX()-tx), wy + (e.getRawY()-ty)); break;
            case 1: if (!moved) expandPanel(); break;
        }
        return true;
    });
    appendLog("悬浮球已就绪");
}

// ===== 食物选项 =====
var foodOptions = ["水稻", "玉米", "土豆", "西红柿", "胡萝卜", "卷心菜", "大豆"];
var selectedFood = foodOptions[0];

// ===== 控制面板 =====
function expandPanel() {
    closeFloat();
    var dm = context.getResources().getDisplayMetrics();
    var pw = Math.round(dm.widthPixels * 0.8);
    floatWin = floaty.rawWindow(
        <frame id="panel_root" bg="#00000000">
            <card cardCornerRadius="20dp" cardElevation="4dp" cardBackgroundColor="#FEFEFE" w="*" h="auto">
                <vertical padding="0">
                <horizontal id="title_bar" gravity="center_vertical" bg="#F5F2ED" padding="14 12 10 12">
                    <text text="水世界辅助" textColor="#6750A4" textSize="14sp" textStyle="bold" layout_weight="1"/>
                    <text id="btn_close" text="✕" textColor="#79747E" textSize="16sp" padding="10 4 4 4"/>
                </horizontal>
                <horizontal padding="10 10 10 6">
                    <card id="tab_food" w="0" layout_weight="1" h="auto" cardCornerRadius="12dp"
                          cardElevation="2dp" cardBackgroundColor="#EADDFF" margin="0 4 4 0"
                          foreground="?selectableItemBackground">
                        <text id="tab_food_t" text="种植" textColor="#21005D" textSize="11sp" gravity="center" padding="8 6"/>
                    </card>
                    <card id="tab_weapon" w="0" layout_weight="1" h="auto" cardCornerRadius="12dp"
                          cardElevation="2dp" cardBackgroundColor="#E0DCE6" margin="4 4 4 0"
                          foreground="?selectableItemBackground">
                        <text id="tab_weapon_t" text="锻造" textColor="#49454F" textSize="11sp" gravity="center" padding="8 6"/>
                    </card>
                    <card id="tab_war" w="0" layout_weight="1" h="auto" cardCornerRadius="12dp"
                          cardElevation="2dp" cardBackgroundColor="#E0DCE6" margin="4 4 0 0"
                          foreground="?selectableItemBackground">
                        <text id="tab_war_t" text="盟战" textColor="#49454F" textSize="11sp" gravity="center" padding="8 6"/>
                    </card>
                </horizontal>
                <vertical padding="14 8 14 4">
                    <vertical id="set_food">
                        <text text="选择作物" textColor="#79747E" textSize="11sp" margin="0 0 6 0"/>
                        <card id="food_selector" w="*" h="auto" cardCornerRadius="14dp" cardElevation="2dp"
                              cardBackgroundColor="#E0DCE6" padding="14 12"
                              foreground="?selectableItemBackground">
                            <horizontal gravity="center_vertical">
                                <text id="food_label" text="水稻" textColor="#1C1B1F" textSize="13sp" layout_weight="1"/>
                                <text text="▾" textColor="#79747E" textSize="14sp"/>
                            </horizontal>
                        </card>
                    </vertical>
                    <vertical id="set_weapon" visibility="gone"/>
                    <vertical id="set_war" visibility="gone"/>
                </vertical>
                <card id="btn_run" w="*" h="auto" cardCornerRadius="14dp" cardElevation="4dp"
                      cardBackgroundColor="#6750A4" margin="12 4 12 10"
                      foreground="?selectableItemBackground">
                    <text id="btn_run_t" text="&#9654;  运行" textColor="#FFFFFF" textSize="13sp"
                          gravity="center" textStyle="bold" padding="12 8"/>
                </card>
                <horizontal padding="14 4 14 12" gravity="center_vertical">
                    <frame id="dot" w="6" h="6" bg="#79747E" margin="0 8 0 0"/>
                    <text id="status_t" text="就绪" textColor="#79747E" textSize="11sp" layout_weight="1"/>
                    <text id="count_t" text="" textColor="#79747E" textSize="11sp"/>
                </horizontal>
                </vertical>
            </card>
        </frame>
    );
    floatWin.setSize(pw, -2);
    floatWin.setPosition(Math.round((dm.widthPixels - pw) / 2), dp(200));
    floatWin.tab_food.on("click", function() { switchTab("food"); });
    floatWin.tab_weapon.on("click", function() { switchTab("weapon"); });
    floatWin.tab_war.on("click", function() { switchTab("war"); });
    floatWin.food_selector.on("click", function() {
        dialogs.select("选择作物", foodOptions, function(idx) {
            if (idx >= 0) {
                selectedFood = foodOptions[idx];
                $ui.run(function() { floatWin.food_label.setText(selectedFood); });
            }
        });
    });
    floatWin.btn_close.on("click", function() { showBall(); });
    floatWin.btn_run.on("click", function() { if (currentTask) stopTask(); else startTask(currentTab); });
    var tx, ty, wx, wy;
    floatWin.title_bar.setOnTouchListener(function(v, e) {
        switch(e.getAction()) {
            case 0: tx = e.getRawX(); ty = e.getRawY(); wx = floatWin.getX(); wy = floatWin.getY(); break;
            case 2: floatWin.setPosition(wx + (e.getRawX()-tx), wy + (e.getRawY()-ty)); break;
        }
        return false;
    });
    if (currentTask) {
        setRunningUI(true);
        try { floatWin.count_t.setText("第 " + runCount + " 次"); } catch(e) {}
    }
}

function closeFloat() { if (floatWin) { floatWin.close(); floatWin = null; } }

function switchTab(tab) {
    currentTab = tab;
    var tabs = ["food", "weapon", "war"];
    for (var i = 0; i < tabs.length; i++) {
        var active = (tabs[i] === tab);
        try {
            floatWin["tab_" + tabs[i]].setCardBackgroundColor(colors.parseColor(active ? "#EADDFF" : "#E0DCE6"));
            floatWin["tab_" + tabs[i] + "_t"].setTextColor(colors.parseColor(active ? "#21005D" : "#49454F"));
            floatWin["set_" + tabs[i]].setVisibility(active ? android.view.View.VISIBLE : android.view.View.GONE);
        } catch(e) {}
    }
}

function startTask(type) {
    if (currentTask) return;
    currentTask = type; runCount = 0; startTime = Date.now();
    var names = { food: "种植", weapon: "锻造", war: "盟战" };
    setRunningUI(true); updateStats(0);
    setStatusUI("运行中 · " + names[type], C.error);
    var timer = setInterval(updateTime, 1000);
    if (type === "food") showBall();
    threads.start(function() {
        if (type === "food") {
            sleep(1500);
            plantFood.run(loadedImages, selectedFood,
                function(count, msg) { runCount = count; updateStats(count); appendLog(msg); try { floatWin.count_t.setText("第 " + count + " 次"); } catch(e) {} },
                function() { return currentTask !== type; },
                appendLog
            );
        } else {
            while (currentTask === type) {
                try {
                    var ok = false;
                    if (type === "weapon") ok = gameHelper.autoWeapon(loadedImages);
                    else if (type === "war") ok = gameHelper.autoWar(loadedImages);
                    if (ok) { runCount++; updateStats(runCount); try { floatWin.count_t.setText("第 " + runCount + " 次"); } catch(e) {} }
                    else { appendLog(names[type] + " 执行失败，等待重试..."); }
                    sleep(2000);
                } catch(e) { appendLog("错误: " + e.message); }
            }
        }
        clearInterval(timer);
    });
}

function stopTask() {
    currentTask = null;
    setRunningUI(false);
    setStatusUI("已停止", C.outline);
    try { floatWin.count_t.setText(""); } catch(e) {}
}

function setRunningUI(running) {
    if (!floatWin) return;
    $ui.run(function() {
        try {
            floatWin.btn_run.setCardBackgroundColor(colors.parseColor(running ? "#B3261E" : "#6750A4"));
            floatWin.btn_run_t.setText(running ? "■  停止" : "▶  运行");
            floatWin.btn_run_t.setTextColor(colors.parseColor(running ? "#F9DEDC" : "#FFFFFF"));
            floatWin.status_t.setText(running ? "运行中" : "就绪");
            floatWin.status_t.setTextColor(colors.parseColor(running ? "#6750A4" : "#79747E"));
            floatWin.dot.setBackgroundColor(colors.parseColor(running ? "#6750A4" : "#79747E"));
        } catch(e) {}
    });
}

$ui.btn_launch.on("click", function() {
    appendLog("正在启动游戏...");
    threads.start(function() {
        try {
            app.launch("com.gx.sw.qa.fkssj007.dyzd.esj");
            appendLog("游戏已启动，等待录屏权限...");
            sleep(10000);
            requestScreenCaptureAsync(false);
            sleep(1000);
            loadedImages = gameHelper.loadImages();
            appendLog("资源加载完成");
            showBall();
        } catch(e) { appendLog("启动失败: " + e.message); }
    });
});
