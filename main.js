// @ts-nocheck
"ui";

var theme = require("./modules/theme.js");
var gameHelper = require("./modules/gameHelper.js");
var plantFood = require("./modules/plantFood.js");
var fleet = require("./modules/fleet.js");
var merchantShip = require("./modules/merchantShip.js");
var war = require("./modules/war.js");
var uiHelpers = require("./modules/uiHelpers.js");
var floatingPanel = require("./modules/floatingPanel.js");

var C = theme.C;
var cropStatMap = theme.cropStatMap;
var redeemCodes = theme.redeemCodes;
var foodOptions = theme.foodOptions;

var loadedImages = null;
var currentTask = null;
var currentTab = "food";
var runCount = 0;
var startTime = 0;
var selectedFood = foodOptions[0];
var selectedShipMode = "once";
var selectedWarMode = "attack";
var harvestStats = { rice: 0, corn: 0, potato: 0, tomato: 0, carrot: 0, cabbage: 0, soybean: 0, weapon: 0 };
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
                                    <text text="辅助工具 v1.0" textColor={C.textMuted} textSize="12sp" margin="0 2 0 0"/>
                                </vertical>
                                <card id="btn_launch" cardCornerRadius="22dp" cardElevation="1dp"
                                      cardBackgroundColor={C.accent} foreground="?selectableItemBackground" w="44" h="44">
                                    <text text="&#9654;" textColor="#FFFFFF" textSize="18sp" gravity="center"/>
                                </card>
                            </horizontal>

                            <text text="今日收获" textColor={C.textMuted} textSize="12sp" textStyle="bold" padding="20 12 10 16"/>

                            {/* Row 1 */}
                            <horizontal w="*" padding="16 0 16 0">
                                <card w="0" layout_weight="1" cardCornerRadius="10dp" cardElevation="0dp" cardBackgroundColor={C.card} margin="0 0 4 4">
                                    <vertical gravity="center" padding="8 10">
                                        <img w="30" h="30" scaleType="centerCrop" circle="true" margin="0 0 0 4" src={"file://" + files.path("./img/种子图标/水稻.png")}/>
                                        <text id="stat_rice" text="0" textColor={C.accent} textSize="22sp" textStyle="bold" gravity="center"/>
                                        <text text="水稻" textColor={C.textMuted} textSize="10sp" gravity="center" margin="0 1 0 0"/>
                                    </vertical>
                                </card>
                                <card w="0" layout_weight="1" cardCornerRadius="10dp" cardElevation="0dp" cardBackgroundColor={C.card} margin="4 0 4 4">
                                    <vertical gravity="center" padding="8 10">
                                        <img w="30" h="30" scaleType="centerCrop" circle="true" margin="0 0 0 4" src={"file://" + files.path("./img/种子图标/玉米.png")}/>
                                        <text id="stat_corn" text="0" textColor={C.accent} textSize="22sp" textStyle="bold" gravity="center"/>
                                        <text text="玉米" textColor={C.textMuted} textSize="10sp" gravity="center" margin="0 1 0 0"/>
                                    </vertical>
                                </card>
                                <card w="0" layout_weight="1" cardCornerRadius="10dp" cardElevation="0dp" cardBackgroundColor={C.card} margin="4 0 4 4">
                                    <vertical gravity="center" padding="8 10">
                                        <img w="30" h="30" scaleType="centerCrop" circle="true" margin="0 0 0 4" src={"file://" + files.path("./img/种子图标/土豆.png")}/>
                                        <text id="stat_potato" text="0" textColor={C.accent} textSize="22sp" textStyle="bold" gravity="center"/>
                                        <text text="土豆" textColor={C.textMuted} textSize="10sp" gravity="center" margin="0 1 0 0"/>
                                    </vertical>
                                </card>
                                <card w="0" layout_weight="1" cardCornerRadius="10dp" cardElevation="0dp" cardBackgroundColor={C.card} margin="4 0 0 4">
                                    <vertical gravity="center" padding="8 10">
                                        <img w="30" h="30" scaleType="centerCrop" circle="true" margin="0 0 0 4" src={"file://" + files.path("./img/种子图标/西红柿.png")}/>
                                        <text id="stat_tomato" text="0" textColor={C.accent} textSize="22sp" textStyle="bold" gravity="center"/>
                                        <text text="西红柿" textColor={C.textMuted} textSize="10sp" gravity="center" margin="0 1 0 0"/>
                                    </vertical>
                                </card>
                            </horizontal>

                            {/* Row 2 */}
                            <horizontal w="*" padding="16 0 16 0">
                                <card w="0" layout_weight="1" cardCornerRadius="10dp" cardElevation="0dp" cardBackgroundColor={C.card} margin="0 0 4 4">
                                    <vertical gravity="center" padding="8 10">
                                        <img w="30" h="30" scaleType="centerCrop" circle="true" margin="0 0 0 4" src={"file://" + files.path("./img/种子图标/胡萝卜.png")}/>
                                        <text id="stat_carrot" text="0" textColor={C.accent} textSize="22sp" textStyle="bold" gravity="center"/>
                                        <text text="胡萝卜" textColor={C.textMuted} textSize="10sp" gravity="center" margin="0 1 0 0"/>
                                    </vertical>
                                </card>
                                <card w="0" layout_weight="1" cardCornerRadius="10dp" cardElevation="0dp" cardBackgroundColor={C.card} margin="4 0 4 4">
                                    <vertical gravity="center" padding="8 10">
                                        <img w="30" h="30" scaleType="centerCrop" circle="true" margin="0 0 0 4" src={"file://" + files.path("./img/种子图标/卷心菜.png")}/>
                                        <text id="stat_cabbage" text="0" textColor={C.accent} textSize="22sp" textStyle="bold" gravity="center"/>
                                        <text text="卷心菜" textColor={C.textMuted} textSize="10sp" gravity="center" margin="0 1 0 0"/>
                                    </vertical>
                                </card>
                                <card w="0" layout_weight="1" cardCornerRadius="10dp" cardElevation="0dp" cardBackgroundColor={C.card} margin="4 0 4 4">
                                    <vertical gravity="center" padding="8 10">
                                        <img w="30" h="30" scaleType="centerCrop" circle="true" margin="0 0 0 4" src={"file://" + files.path("./img/种子图标/大豆.png")}/>
                                        <text id="stat_soybean" text="0" textColor={C.accent} textSize="22sp" textStyle="bold" gravity="center"/>
                                        <text text="大豆" textColor={C.textMuted} textSize="10sp" gravity="center" margin="0 1 0 0"/>
                                    </vertical>
                                </card>
                                <card w="0" layout_weight="1" cardCornerRadius="10dp" cardElevation="0dp" cardBackgroundColor={C.card} margin="4 0 0 4">
                                    <vertical gravity="center" padding="8 10">
                                        <img w="30" h="30" scaleType="centerCrop" circle="true" margin="0 0 0 4" src={"file://" + files.path("./img/镰刀.png")}/>
                                        <text id="stat_weapon" text="0" textColor={C.textPrimary} textSize="22sp" textStyle="bold" gravity="center"/>
                                        <text text="锻造" textColor={C.textMuted} textSize="10sp" gravity="center" margin="0 1 0 0"/>
                                    </vertical>
                                </card>
                            </horizontal>

                            {/* Log */}
                            <text text="运行日志" textColor={C.textMuted} textSize="12sp" textStyle="bold" padding="20 14 10 16"/>
                            <card w="*" cardCornerRadius="12dp" cardElevation="0dp" cardBackgroundColor={C.card} margin="16 0 16 0">
                                <ScrollView id="log_scroll" h="160" padding="12 10">
                                    <text id="txt_log" text="等待操作..." textColor={C.textSecondary} textSize="11sp" typeface="monospace" lineSpacingMultiplier="1.2"/>
                                </ScrollView>
                            </card>

                            <View h="60" bg={C.bg}/>
                        </vertical>
                    </ScrollView>
                </vertical>

                {/* ── Redeem page ── */}
                <vertical id="page_redeem" layout_width="match_parent" layout_height="match_parent" visibility="gone">
                    <ScrollView layout_width="match_parent" layout_height="match_parent" bg={C.bg}>
                        <vertical layout_width="match_parent" padding="16 16 16 12">
                            <text text="兑换码" textColor={C.textPrimary} textSize="20sp" textStyle="bold" margin="0 0 16 0"/>
                            <vertical id="redeem_list"/>
                            <View h="60"/>
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
                                    <horizontal margin="0 0 0 0" gravity="center_vertical">
                                        <text text="&#9733;" textSize="16sp" margin="0 0 10 0"/>
                                        <text text="兑换码一键复制" textColor={C.textSecondary} textSize="13sp"/>
                                    </horizontal>
                                </vertical>
                            </card>
                            <View h="60"/>
                        </vertical>
                    </ScrollView>
                </vertical>

            </frame>

            {/* ── Floating bottom nav ── */}
            <frame w="*" h="auto" margin="60 0 60 16">
                <card cardCornerRadius="26dp" cardElevation="0dp" cardBackgroundColor={C.card} w="*" h="auto">
                    <horizontal gravity="center" padding="10 8">
                        <card id="nav_home" cardCornerRadius="18dp" cardElevation="0dp" cardBackgroundColor={C.accent} w="46" h="46" margin="0 0 6 0" foreground="?selectableItemBackground">
                            <text id="nav_home_icon" text="&#9750;" textColor="#FFFFFF" textSize="20sp" gravity="center"/>
                        </card>
                        <card id="nav_redeem" cardCornerRadius="18dp" cardElevation="0dp" cardBackgroundColor={C.bg} w="46" h="46" margin="6 0 6 0" foreground="?selectableItemBackground">
                            <text id="nav_redeem_icon" text="&#9733;" textColor={C.textMuted} textSize="20sp" gravity="center"/>
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
$ui.nav_redeem.on("click", function() { currentNav = "redeem"; uiHelpers.switchNav("redeem", currentNav, C); });
$ui.nav_about.on("click", function() { currentNav = "about"; uiHelpers.switchNav("about", currentNav, C); });

// ── Build redeem list ──
uiHelpers.buildRedeemList(redeemCodes, C, uiHelpers.dateStr);

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

// ── Init panel state ──
floatingPanel.selectedFood = selectedFood;
floatingPanel.selectedShipMode = selectedShipMode;
floatingPanel.selectedWarMode = selectedWarMode;
floatingPanel.currentTab = currentTab;

// ── Floating panel context ──
var panelCtx = {
    C: C, dp: dp, icoBitmap: icoBitmap, foodOptions: foodOptions,
    appendLog: function(msg) { uiHelpers.appendLog(msg); },
    onFoodChange: function(food) { selectedFood = food; floatingPanel.selectedFood = food; },
    onShipModeChange: function(mode) { selectedShipMode = mode; floatingPanel.selectedShipMode = mode; },
    onWarModeChange: function(mode) { selectedWarMode = mode; floatingPanel.selectedWarMode = mode; },
    onTabChange: function(tab) { currentTab = tab; floatingPanel.currentTab = tab; },
    onRun: function() { startTask(currentTab); },
    onStop: function() { stopTask(); }
};

// ── Task management ──
function startTask(type) {
    if (currentTask) return;
    currentTask = type; runCount = 0; startTime = Date.now();
    var names = { food: "种植", weapon: "锻造", ship: "商船", war: "盟战" };
    floatingPanel.runCount = 0;
    floatingPanel.running = true;
    floatingPanel.setRunningUI(true, C);
    uiHelpers.updateStats(0, currentTab, selectedFood, harvestStats, cropStatMap);
    floatingPanel.showBall(panelCtx);
    threads.start(function() {
        if (type === "food") {
            sleep(1500);
            plantFood.run(loadedImages, selectedFood,
                function(count, msg) {
                    runCount = count;
                    floatingPanel.runCount = count;
                    uiHelpers.updateStats(count, currentTab, selectedFood, harvestStats, cropStatMap);
                    uiHelpers.appendLog(msg);
                    try { var ct = floatingPanel.getCountText(); if (ct) ct.setText("第 " + count + " 次"); } catch(e) {}
                },
                function() { return currentTask !== type; },
                function(msg) { uiHelpers.appendLog(msg); },
                function(newFood) {
                    selectedFood = newFood;
                    floatingPanel.selectedFood = newFood;
                    floatingPanel.updateFoodLabel(newFood);
                }
            );
        } else {
            var shouldStop = function() { return currentTask !== type; };
            var logFn = function(msg) { uiHelpers.appendLog(msg); };
            if (type === "weapon") gameHelper.autoWeapon(loadedImages, shouldStop, logFn);
            else if (type === "ship") merchantShip.run(loadedImages, shouldStop, logFn, selectedShipMode);
            else if (type === "war") war.run(loadedImages, shouldStop, logFn, selectedWarMode);
        }
    });
}

function stopTask() {
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
            app.launch("com.gx.sw.qa.fkssj007.dyzd.esj");
            uiHelpers.appendLog("游戏已启动，等待录屏权限...");
            sleep(4000);
            requestScreenCaptureAsync(false);
            sleep(1000);
            loadedImages = gameHelper.loadImages();
            uiHelpers.appendLog("资源加载完成");
            floatingPanel.showBall(panelCtx);
        } catch(e) { uiHelpers.appendLog("启动失败: " + e.message); }
    });
});
