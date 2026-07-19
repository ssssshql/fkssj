// @ts-nocheck
"ui";

var theme = require("./modules/theme.js");
var gameHelper = require("./modules/gameHelper.js");
var plantFood = require("./modules/plantFood.js");
var fleet = require("./modules/fleet.js");
var merchantShip = require("./modules/merchantShip.js");
var war = require("./modules/war.js");
var weapon = require("./modules/weapon.js");
var uiHelpers = require("./modules/uiHelpers.js");
var floatingPanel = require("./modules/floatingPanel.js");
var navigate = require("./modules/navigate.js");

var C = theme.C;
var foodOptions = theme.foodOptions;

var loadedImages = null;
var currentTask = null;
var selectedTask = "food";
var runCount = 0;
var startTime = 0;
var selectedFood = foodOptions[0];
var selectedShipMode = "once";
var selectedWarMode = "attack";
var harvestStats = floatingPanel.stats;
var currentNav = "home";
var icoBitmap = images.read("./ico.png").getBitmap();

function dp(v) { return Math.round(v * context.getResources().getDisplayMetrics().density); }

// ── Layout ──
$ui.layout(
    <frame layout_width="match_parent" layout_height="match_parent" bg={C.bg}>
        <vertical layout_width="match_parent" layout_height="match_parent" bg={C.bg}>

            <frame layout_width="match_parent" layout_height="0dp" layout_weight="1">

                {/* ── Home ── */}
                <vertical id="page_home" layout_width="match_parent" layout_height="match_parent">
                    <ScrollView layout_width="match_parent" layout_height="match_parent" bg={C.bg}>
                        <vertical layout_width="match_parent" padding="0 0 0 12">

                            <horizontal bg={C.bg} padding="16 20 16 16" gravity="center_vertical">
                                <frame w="48" h="48" margin="0 0 12 0">
                                    <ImageView id="ico_view" scaleType="centerCrop" layout_width="match_parent" layout_height="match_parent"/>
                                </frame>
                                <vertical layout_weight="1">
                                    <text text="疯狂水世界" textColor={C.textPrimary} textSize="21sp" textStyle="bold"/>
                                    <text text="辅助工具 v1.0" textColor={C.textMuted} textSize="13sp" margin="0 2 0 0"/>
                                </vertical>
                                <card id="btn_launch" cardCornerRadius="22dp" cardElevation="1dp"
                                      cardBackgroundColor={C.accent} foreground="?selectableItemBackground" w="44" h="44">
                                    <text text="&#9654;" textColor="#FFFFFF" textSize="18sp" gravity="center"/>
                                </card>
                            </horizontal>

                            <text text="累计统计" textColor={C.textMuted} textSize="13sp" textStyle="bold" padding="20 12 10 16"/>

                            <horizontal w="*" padding="16 0 16 0">
                                <card w="0" layout_weight="1" cardCornerRadius="10dp" cardElevation="0dp" cardBackgroundColor={C.card} margin="0 0 4 4">
                                    <vertical gravity="center" padding="8 10">
                                        <text text="&#127793;" textSize="22sp" gravity="center" margin="0 0 0 4"/>
                                        <text id="stat_food" text="0" textColor={C.accent} textSize="22sp" textStyle="bold" gravity="center"/>
                                        <text text="种植" textColor={C.textMuted} textSize="12sp" gravity="center" margin="0 1 0 0"/>
                                    </vertical>
                                </card>
                                <card w="0" layout_weight="1" cardCornerRadius="10dp" cardElevation="0dp" cardBackgroundColor={C.card} margin="4 0 4 4">
                                    <vertical gravity="center" padding="8 10">
                                        <text text="&#9876;" textSize="22sp" gravity="center" margin="0 0 0 4"/>
                                        <text id="stat_weapon" text="0" textColor={C.accent} textSize="22sp" textStyle="bold" gravity="center"/>
                                        <text text="锻造" textColor={C.textMuted} textSize="12sp" gravity="center" margin="0 1 0 0"/>
                                    </vertical>
                                </card>
                                <card w="0" layout_weight="1" cardCornerRadius="10dp" cardElevation="0dp" cardBackgroundColor={C.card} margin="4 0 4 4">
                                    <vertical gravity="center" padding="8 10">
                                        <text text="&#9973;" textSize="22sp" gravity="center" margin="0 0 0 4"/>
                                        <text id="stat_ship" text="0" textColor={C.accent} textSize="22sp" textStyle="bold" gravity="center"/>
                                        <text text="商船" textColor={C.textMuted} textSize="12sp" gravity="center" margin="0 1 0 0"/>
                                    </vertical>
                                </card>
                                <card w="0" layout_weight="1" cardCornerRadius="10dp" cardElevation="0dp" cardBackgroundColor={C.card} margin="4 0 0 4">
                                    <vertical gravity="center" padding="8 10">
                                        <text text="&#128293;" textSize="22sp" gravity="center" margin="0 0 0 4"/>
                                        <text id="stat_war" text="0" textColor={C.accent} textSize="22sp" textStyle="bold" gravity="center"/>
                                        <text text="盟战" textColor={C.textMuted} textSize="12sp" gravity="center" margin="0 1 0 0"/>
                                    </vertical>
                                </card>
                            </horizontal>

                            {/* Device info */}
                            <text text="设备信息" textColor={C.textMuted} textSize="13sp" textStyle="bold" padding="20 14 10 12"/>
                            <card w="*" cardCornerRadius="10dp" cardElevation="0dp" cardBackgroundColor={C.card} margin="16 0 16 0">
                                <vertical padding="12 10">
                                    <horizontal gravity="center_vertical" margin="0 0 0 6">
                                        <text text="品牌型号" textColor={C.textSecondary} textSize="13sp" w="70"/>
                                        <text id="txt_device_model" text="--" textColor={C.textPrimary} textSize="13sp" textStyle="bold"/>
                                    </horizontal>
                                    <horizontal gravity="center_vertical" margin="0 0 0 6">
                                        <text text="Android" textColor={C.textSecondary} textSize="13sp" w="70"/>
                                        <text id="txt_device_android" text="--" textColor={C.textPrimary} textSize="13sp" textStyle="bold"/>
                                        <text id="txt_android_status" text="" textColor={C.textMuted} textSize="12sp" margin="8 0 0 0"/>
                                    </horizontal>
                                    <horizontal gravity="center_vertical" margin="0 0 0 6">
                                        <text text="分辨率" textColor={C.textSecondary} textSize="13sp" w="70"/>
                                        <text id="txt_resolution" text="--" textColor={C.textPrimary} textSize="13sp" textStyle="bold"/>
                                        <text id="txt_resolution_status" text="" textColor={C.textMuted} textSize="12sp" margin="8 0 0 0"/>
                                    </horizontal>
                                    <horizontal gravity="center_vertical">
                                        <text text="电量" textColor={C.textSecondary} textSize="13sp" w="70"/>
                                        <text id="txt_device_battery" text="--" textColor={C.textPrimary} textSize="13sp" textStyle="bold"/>
                                    </horizontal>
                                </vertical>
                            </card>

                            {/* Permissions */}
                            <text text="权限状态" textColor={C.textMuted} textSize="13sp" textStyle="bold" padding="20 14 10 12"/>
                            <card w="*" cardCornerRadius="10dp" cardElevation="0dp" cardBackgroundColor={C.card} margin="16 0 16 0">
                                <vertical padding="12 10">
                                    <horizontal id="perm_pkg_list_row" gravity="center_vertical" margin="0 0 0 8" foreground="?selectableItemBackground">
                                        <text text="应用列表" textColor={C.textSecondary} textSize="13sp" layout_weight="1"/>
                                        <text id="perm_pkg_list_label" text="未开启" textColor={C.error} textSize="12sp" margin="0 0 8 0"/>
                                        <Switch id="perm_pkg_list" checked="false" clickable="false" w="auto" h="auto"/>
                                    </horizontal>
                                    <horizontal id="perm_access_row" gravity="center_vertical" margin="0 0 0 8" foreground="?selectableItemBackground">
                                        <text text="无障碍" textColor={C.textSecondary} textSize="13sp" layout_weight="1"/>
                                        <text id="perm_access_label" text="未开启" textColor={C.error} textSize="12sp" margin="0 0 8 0"/>
                                        <Switch id="perm_access" checked="false" clickable="false" w="auto" h="auto"/>
                                    </horizontal>
                                    <horizontal id="perm_overlay_row" gravity="center_vertical" foreground="?selectableItemBackground">
                                        <text text="悬浮窗" textColor={C.textSecondary} textSize="13sp" layout_weight="1"/>
                                        <text id="perm_overlay_label" text="未开启" textColor={C.error} textSize="12sp" margin="0 0 8 0"/>
                                        <Switch id="perm_overlay" checked="false" clickable="false" w="auto" h="auto"/>
                                    </horizontal>
                                </vertical>
                            </card>

                            {/* Log */}
                            <text text="运行日志" textColor={C.textMuted} textSize="13sp" textStyle="bold" padding="20 14 10 16"/>
                            <card w="*" cardCornerRadius="12dp" cardElevation="0dp" cardBackgroundColor={C.card} margin="16 0 16 0">
                                <ScrollView id="log_scroll" h="160" padding="12 10">
                                    <text id="txt_log" text="等待操作..." textColor={C.textSecondary} textSize="13sp" typeface="monospace" lineSpacingMultiplier="1.0"/>
                                </ScrollView>
                            </card>

                            <View h="60" bg={C.bg}/>
                        </vertical>
                    </ScrollView>
                </vertical>

                {/* ── About page ── */}
                <vertical id="page_about" layout_width="match_parent" layout_height="match_parent" visibility="gone">
                    <ScrollView layout_width="match_parent" layout_height="match_parent" bg={C.bg}>
                        <vertical layout_width="match_parent" padding="20 20 20 20">
                            <frame w="*" h="auto" margin="0 0 12 0" gravity="center_horizontal">
                                <card w="72" h="72" cardCornerRadius="36dp" cardElevation="0dp" cardBackgroundColor={C.card}>
                                    <img w="72" h="72" scaleType="centerCrop" circle="true" src={"file://" + files.path("./ico.png")}/>
                                </card>
                            </frame>
                            <text text="疯狂水世界" textColor={C.textPrimary} textSize="22sp" textStyle="bold" gravity="center"/>
                            <text text="辅助工具 v1.0" textColor={C.textSecondary} textSize="13sp" gravity="center" margin="0 4 0 24"/>
                            <card w="*" cardCornerRadius="14dp" cardElevation="0dp" cardBackgroundColor={C.card}>
                                <vertical padding="20 18">
                                    <text text="功能介绍" textColor={C.textPrimary} textSize="15sp" textStyle="bold" margin="0 0 14 0"/>
                                    <horizontal margin="0 0 0 10" gravity="center_vertical">
                                        <text text="&#127793;" textSize="16sp" margin="0 0 10 0"/>
                                        <text text="自动种植、收割作物" textColor={C.textSecondary} textSize="13sp"/>
                                    </horizontal>
                                    <horizontal margin="0 0 0 10" gravity="center_vertical">
                                        <text text="&#9876;" textSize="16sp" margin="0 0 10 0"/>
                                        <text text="自动锻造武器" textColor={C.textSecondary} textSize="13sp"/>
                                    </horizontal>
                                    <horizontal margin="0 0 0 10" gravity="center_vertical">
                                        <text text="&#128293;" textSize="16sp" margin="0 0 10 0"/>
                                        <text text="自动参与盟战" textColor={C.textSecondary} textSize="13sp"/>
                                    </horizontal>
                            <horizontal margin="0 0 0 10" gravity="center_vertical">
                                        <text text="&#9973;" textSize="16sp" margin="0 0 10 0"/>
                                        <text text="自动搁浅商船出征" textColor={C.textSecondary} textSize="13sp"/>
                                    </horizontal>
                                    <horizontal margin="0 0 0 0" gravity="center_vertical">
                                        <text text="&#9733;" textSize="16sp" margin="0 0 10 0"/>
                                        <text text="悬浮球控制面板" textColor={C.textSecondary} textSize="13sp"/>
                                    </horizontal>
                                </vertical>
                            </card>

                            <card id="github_link" w="*" cardCornerRadius="14dp" cardElevation="0dp" cardBackgroundColor={C.card} margin="0 12 0 0">
                                <horizontal padding="16 14" gravity="center_vertical" foreground="?selectableItemBackground">
                                    <text text="&#128279;" textSize="16sp" margin="0 0 10 0"/>
                                    <vertical layout_weight="1">
                                        <text text="GitHub" textColor={C.textPrimary} textSize="13sp" textStyle="bold"/>
                                        <text text="github.com/ssssshql/fkssj" textColor={C.textSecondary} textSize="11sp" margin="0 2 0 0"/>
                                    </vertical>
                                    <text text="&#8250;" textColor={C.textMuted} textSize="18sp"/>
                                </horizontal>
                            </card>

                            <text text="本工具仅供学习交流使用" textColor={C.textMuted} textSize="10sp" gravity="center" margin="0 16 0 0"/>
                            <View h="60"/>
                        </vertical>
                    </ScrollView>
                </vertical>

            </frame>

            {/* ── Floating bottom nav ── */}
            <frame w="*" h="auto" margin="80 0 80 16">
                <card cardCornerRadius="26dp" cardElevation="0dp" cardBackgroundColor={C.card} w="*" h="auto">
                    <horizontal gravity="center" padding="10 8">
                        <card id="nav_home" cardCornerRadius="18dp" cardElevation="0dp" cardBackgroundColor={C.accent} w="46" h="46" margin="0 0 6 0" foreground="?selectableItemBackground">
                            <text id="nav_home_icon" text="&#9750;" textColor="#FFFFFF" textSize="20sp" gravity="center"/>
                        </card>
                        <card id="nav_about" cardCornerRadius="18dp" cardElevation="0dp" cardBackgroundColor={C.bg} w="46" h="46" margin="6 0 0 0" foreground="?selectableItemBackground">
                            <text id="nav_about_icon" text="&#9432;" textColor={C.textMuted} textSize="20sp" gravity="center"/>
                        </card>
                    </horizontal>
                </card>
            </frame>

        </vertical>
    </frame>
);

// ── Nav ──
$ui.nav_home.on("click", function() { currentNav = "home"; uiHelpers.switchNav("home", currentNav, C); });
$ui.nav_about.on("click", function() { currentNav = "about"; uiHelpers.switchNav("about", currentNav, C); });
$ui.github_link.on("click", function() {
    app.openUrl("https://github.com/ssssshql/fkssj");
});

// ── Circle icon ──
uiHelpers.initCircleIcon($ui.ico_view, icoBitmap);
try { $ui.ico_view.setImageBitmap(icoBitmap); } catch(e) {}

// ── Status bar ──
$ui.statusBarColor(C.bg);
$ui.navigationBarColor && $ui.navigationBarColor("#FFFFFF");
try {
    var decor = context.getWindow().getDecorView();
    decor.setSystemUiVisibility(decor.getSystemUiVisibility() | 0x00002000 | 0x00000010);
    decor.setBackgroundColor(colors.parseColor(C.bg));
} catch(e) {}

// ── Init panel state（从持久化配置恢复）──
if (floatingPanel.selectedFood) selectedFood = floatingPanel.selectedFood;
else floatingPanel.selectedFood = selectedFood;
selectedShipMode = floatingPanel.selectedShipMode;
selectedWarMode = floatingPanel.selectedWarMode;
selectedTask = floatingPanel.currentTask;

// ── Floating panel context ──
var panelCtx = {
    C: C, dp: dp, icoBitmap: icoBitmap, foodOptions: foodOptions,
    appendLog: function(msg) { uiHelpers.appendLog(msg); },
    onFoodChange: function(food) { selectedFood = food; floatingPanel.selectedFood = food; },
    onShipModeChange: function(mode) { selectedShipMode = mode; floatingPanel.selectedShipMode = mode; },
    onWarModeChange: function(mode) { selectedWarMode = mode; floatingPanel.selectedWarMode = mode; },
    onTaskChange: function(task) { selectedTask = task; },
    onRun: function() { startTask(selectedTask); },
    onStop: function() { stopTask(); }
};

// ── Init stats display & resolution ──
uiHelpers.initStats(harvestStats);
try {
    var res = gameHelper.getRealResolution();
    var rw = res[0], rh = res[1];
    $ui.txt_resolution.setText(rw + " × " + rh);
    var supported = (rw === 1080 && rh === 2400);
    $ui.txt_resolution.setTextColor(colors.parseColor(supported ? C.textPrimary : C.error));
    $ui.txt_resolution_status.setText(supported ? "已适配" : "未适配");
    $ui.txt_resolution_status.setTextColor(colors.parseColor(supported ? C.green : C.error));
} catch(e) { log("分辨率检测失败: " + e); }
try {
    $ui.txt_device_model.setText(device.brand + " " + device.model);
    var sdkOk = device.sdkInt >= 24;
    $ui.txt_device_android.setText("Android " + device.release + " (API " + device.sdkInt + ")");
    $ui.txt_device_android.setTextColor(colors.parseColor(sdkOk ? C.textPrimary : C.error));
    $ui.txt_android_status.setText(sdkOk ? "已适配" : "版本过低");
    $ui.txt_android_status.setTextColor(colors.parseColor(sdkOk ? C.green : C.error));
} catch(e) {}
try {
    var bat = device.getBattery();
    var charging = device.isCharging();
    $ui.txt_device_battery.setText(Math.round(bat) + "%" + (charging ? " 充电中" : ""));
} catch(e) {}

// ── Permission checks ──
function checkPerms() {
    var ok1 = gameHelper.hasPackageListPerm();
    var ok2 = gameHelper.hasAccessibilityPerm();
    var ok3 = gameHelper.hasOverlayPerm();
    $ui.run(function() {
        try { $ui.perm_pkg_list.setChecked(ok1); $ui.perm_pkg_list_label.setText(ok1 ? "已开启" : "未开启"); $ui.perm_pkg_list_label.setTextColor(colors.parseColor(ok1 ? C.green : C.error)); } catch(e) {}
        try { $ui.perm_access.setChecked(ok2); $ui.perm_access_label.setText(ok2 ? "已开启" : "未开启"); $ui.perm_access_label.setTextColor(colors.parseColor(ok2 ? C.green : C.error)); } catch(e) {}
        try { $ui.perm_overlay.setChecked(ok3); $ui.perm_overlay_label.setText(ok3 ? "已开启" : "未开启"); $ui.perm_overlay_label.setTextColor(colors.parseColor(ok3 ? C.green : C.error)); } catch(e) {}
    });
    return ok1 && ok2 && ok3;
}
checkPerms();

// 定时刷新权限状态（每 3 秒）
setInterval(function() { checkPerms(); }, 3000);

// 点击行跳转设置页
$ui.perm_pkg_list_row.on("click", function() {
    try {
        var intent = new android.content.Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        intent.setData(android.net.Uri.parse("package:" + context.getPackageName()));
        app.startActivity(intent);
    } catch(e) {}
});
$ui.perm_access_row.on("click", function() {
    try {
        app.startActivity(new android.content.Intent(android.provider.Settings.ACTION_ACCESSIBILITY_SETTINGS));
    } catch(e) {}
});
$ui.perm_overlay_row.on("click", function() {
    try {
        var intent = new android.content.Intent(android.provider.Settings.ACTION_MANAGE_OVERLAY_PERMISSION);
        intent.setData(android.net.Uri.parse("package:" + context.getPackageName()));
        app.startActivity(intent);
    } catch(e) {}
});

// ── Task management ──
function startTask(type) {
    if (currentTask) return;
    if (!checkPerms()) {
        toast("请先开启所需权限");
        return;
    }
    var freqs = floatingPanel.readFreqs();
    currentTask = type; runCount = 0; startTime = Date.now();
    var names = { food: "种植", weapon: "锻造", ship: "商船", war: "盟战" };
    uiHelpers.appendLog("[启动] " + names[type] + "任务 (" + freqs[type] + "s)");
    floatingPanel.runCount = 0;
    floatingPanel.running = true;
    floatingPanel.setRunningUI(true, C);
    uiHelpers.initStats(harvestStats);
    floatingPanel.showBall(panelCtx);
    threads.start(function() {
        var shouldStopFn = function() { return currentTask !== type; };
        // 整点万吨商船 - 启动时就运行（在主任务之前）
        if ((type === "food" || type === "weapon") && floatingPanel.shipInFood && floatingPanel.shipRunOnStart) {
            var _shipLog = function(msg) { uiHelpers.appendLog(msg); };
            merchantShip.runHourlyOnce(loadedImages, _shipLog, shouldStopFn);
            if (shouldStopFn()) { stopTask(); return; }
        }
        if (type === "food") {
            var logFn = function(msg) { uiHelpers.appendLog(msg); };
            // 自动定位到种植区
            if (!navigate.autoLocate(loadedImages, logFn)) {
                uiHelpers.appendLog("自动定位失败，任务取消");
                stopTask();
                return;
            }
            sleep(1000);
            plantFood.run(loadedImages, selectedFood,
                function(count, msg) {
                    runCount = count;
                    floatingPanel.runCount = count;
                    if (msg.indexOf("完成") !== -1) {
                        harvestStats.food = (harvestStats.food || 0) + 1;
                        uiHelpers.updateStats("food", harvestStats);
                        floatingPanel._saveConfig();
                    }
                    uiHelpers.appendLog(msg);
                },
                function() { return currentTask !== type; },
                function(msg) { uiHelpers.appendLog(msg); },
                function(newFood) {
                    selectedFood = newFood;
                    floatingPanel.selectedFood = newFood;
                    floatingPanel.updateFoodLabel(newFood);
                },
                freqs.food,
                floatingPanel.shipInFood,
                floatingPanel.shipRunOnStart,
                function() { return navigate.autoLocate(loadedImages, logFn); }
            );
        } else {
            var shouldStop = function() { return currentTask !== type; };
            var logFn = function(msg) { uiHelpers.appendLog(msg); };
            if (type === "weapon") {
                // 确保在基地界面
                var scene = navigate.detectScene(loadedImages);
                if (scene === "world") {
                    var basePos = gameHelper.findFirst(loadedImages.baseIcon, 0.7, "基地图标");
                    if (basePos) {
                        click(basePos.x + loadedImages.baseIcon.getWidth() / 2, basePos.y + loadedImages.baseIcon.getHeight() / 2);
                        logFn("切换到基地");
                        sleep(3000);
                    }
                } else if (scene === "unknown") {
                    uiHelpers.appendLog("未在游戏界面，任务取消");
                    stopTask();
                    return;
                }
                weapon.run(loadedImages, shouldStop, logFn, freqs.weapon, floatingPanel.shipInFood, floatingPanel.shipRunOnStart, floatingPanel.weaponType, floatingPanel.weaponLevel, function() {
                    harvestStats.weapon = (harvestStats.weapon || 0) + 1;
                    uiHelpers.updateStats("weapon", harvestStats);
                    floatingPanel._saveConfig();
                });
            }
            else if (type === "ship") {
                merchantShip.run(loadedImages, shouldStop, logFn, selectedShipMode, freqs.ship, function() {
                    harvestStats.ship = (harvestStats.ship || 0) + 1;
                    uiHelpers.updateStats("ship", harvestStats);
                    floatingPanel._saveConfig();
                });
            }
            else if (type === "war") {
                war.run(loadedImages, shouldStop, logFn, selectedWarMode, freqs.war, floatingPanel.warClaimReward, function() {
                    harvestStats.war = (harvestStats.war || 0) + 1;
                    uiHelpers.updateStats("war", harvestStats);
                    floatingPanel._saveConfig();
                });
            }
        }
        floatingPanel._saveConfig();
    });
}

function stopTask() {
    var names = { food: "种植", weapon: "锻造", ship: "商船", war: "盟战" };
    uiHelpers.appendLog("[停止] " + (names[currentTask] || "") + "任务");
    currentTask = null;
    floatingPanel.running = false;
    floatingPanel.setRunningUI(false, C);
    try { var ct = floatingPanel.getCountText(); if (ct) ct.setText(""); } catch(e) {}
}

// ── Launch ──
$ui.btn_launch.on("click", function() {
    uiHelpers.appendLog("正在启动游戏...");
    threads.start(function() {
        try {
            app.launchApp("疯狂水世界")
            uiHelpers.appendLog("游戏已启动，等待录屏权限...");
            sleep(1000);
            requestScreenCaptureAsync(false);
            sleep(1000);
            loadedImages = gameHelper.loadImages();
            uiHelpers.appendLog("资源加载完成");
            floatingPanel.showBall(panelCtx);
        } catch(e) { uiHelpers.appendLog("启动失败: " + e.message); }
    });
});
