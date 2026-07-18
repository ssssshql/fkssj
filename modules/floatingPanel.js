// floatingPanel.js — 悬浮球 + 控制面板

var panel = {};
var floatWin = null;
var _sto = storages.create("fkssj_config");

// 状态存储在模块上，避免跨上下文丢失
panel.selectedFood = "";
panel.selectedShipMode = "once";
panel.selectedWarMode = "attack";
panel.warClaimReward = true;
panel.shipInFood = false;
panel.shipRunOnStart = false;
panel.weaponType = "枪械";
panel.weaponLevel = "蓝级";
panel.running = false;
panel.runCount = 0;
panel.currentTask = "food";
panel._ballPos = null;
panel.freq = { food: 30, weapon: 30, ship: 60, war: 20 };
panel.stats = { food: 0, weapon: 0, ship: 0, war: 0 };

// 从本地存储恢复配置
panel._loadConfig = function() {
    try {
        var cfg = _sto.get("config");
        if (cfg) {
            if (cfg.selectedFood) panel.selectedFood = cfg.selectedFood;
            if (cfg.selectedShipMode) panel.selectedShipMode = cfg.selectedShipMode;
            if (cfg.selectedWarMode) panel.selectedWarMode = cfg.selectedWarMode;
            if (typeof cfg.warClaimReward === "boolean") panel.warClaimReward = cfg.warClaimReward;
            if (typeof cfg.shipInFood === "boolean") panel.shipInFood = cfg.shipInFood;
            if (typeof cfg.shipRunOnStart === "boolean") panel.shipRunOnStart = cfg.shipRunOnStart;
            if (cfg.weaponType) panel.weaponType = cfg.weaponType;
            if (cfg.weaponLevel) panel.weaponLevel = cfg.weaponLevel;
            if (cfg.currentTask) panel.currentTask = cfg.currentTask;
            if (cfg.freq) {
                if (cfg.freq.food) panel.freq.food = cfg.freq.food;
                if (cfg.freq.weapon) panel.freq.weapon = cfg.freq.weapon;
                if (cfg.freq.ship) panel.freq.ship = cfg.freq.ship;
                if (cfg.freq.war) panel.freq.war = cfg.freq.war;
            }
            if (cfg.ballPos) panel._ballPos = cfg.ballPos;
            if (cfg.stats) panel.stats = cfg.stats;
        }
    } catch(e) {}
};

panel._saveConfig = function() {
    try {
        _sto.put("config", {
            selectedFood: panel.selectedFood,
            selectedShipMode: panel.selectedShipMode,
            selectedWarMode: panel.selectedWarMode,
            warClaimReward: panel.warClaimReward,
            shipInFood: panel.shipInFood,
            shipRunOnStart: panel.shipRunOnStart,
            weaponType: panel.weaponType,
            weaponLevel: panel.weaponLevel,
            currentTask: panel.currentTask,
            freq: panel.freq,
            ballPos: panel._ballPos,
            stats: panel.stats
        });
    } catch(e) {}
};

// 启动时加载配置
panel._loadConfig();

function closeFloat() {
    if (floatWin) {
        try { floatWin.close(); } catch(e) {}
        floatWin = null;
    }
}
panel.closeFloat = closeFloat;

var taskNames = { food: "种植", weapon: "锻造", ship: "商船", war: "盟战" };

panel.showBall = function(ctx) {
    closeFloat();
    var dp = ctx.dp;
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
        var glowColor = panel.running ? "#334CAF50" : "#33A04468";
        var glowColor2 = panel.running ? "#1A4CAF50" : "#1AA04468";
        var ringColor = panel.running ? "#664CAF50" : "#66A04468";
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
        var src = new android.graphics.Rect(0, 0, ctx.icoBitmap.getWidth(), ctx.icoBitmap.getHeight());
        var dst = new android.graphics.Rect(pad, pad, pad + sz, pad + sz);
        canvas.drawBitmap(ctx.icoBitmap, src, dst, p);
        p.setXfermode(null);
        canvas.restore();
    });
    floatWin.cv.invalidate();
    var dm = context.getResources().getDisplayMetrics();
    var resId = context.getResources().getIdentifier("status_bar_height", "dimen", "android");
    var statusBarH = context.getResources().getDimensionPixelSize(resId);
    var initX, initY;
    if (panel._ballPos) {
        initX = panel._ballPos.x;
        initY = panel._ballPos.y;
    } else {
        initX = dm.widthPixels - total - dp(6);
        initY = -statusBarH;
    }
    floatWin.setPosition(initX, initY);
    var tx, ty, wx, wy, moved;
    floatWin.root.setOnTouchListener(function(v, e) {
        switch(e.getAction()) {
            case 0: tx = e.getRawX(); ty = e.getRawY(); wx = floatWin.getX(); wy = floatWin.getY(); moved = false; break;
            case 2:
                if (Math.abs(e.getRawX()-tx) > 8 || Math.abs(e.getRawY()-ty) > 8) moved = true;
                var nx = Math.max(0, Math.min(dm.widthPixels - total, wx + (e.getRawX()-tx)));
                var ny = Math.max(-statusBarH, Math.min(dm.heightPixels - statusBarH - total - dp(10), wy + (e.getRawY()-ty)));
                floatWin.setPosition(nx, ny);
                break;
            case 1:
                panel._ballPos = { x: floatWin.getX(), y: floatWin.getY() };
                panel._saveConfig();
                if (!moved) panel.expandPanel(ctx);
                break;
        }
        return true;
    });
    ctx.appendLog("悬浮球已就绪");
};

panel.expandPanel = function(ctx) {
    closeFloat();
    var dp = ctx.dp;
    var C = ctx.C;
    var dm = context.getResources().getDisplayMetrics();
    var resId = context.getResources().getIdentifier("status_bar_height", "dimen", "android");
    var statusBarH = context.getResources().getDimensionPixelSize(resId);
    var pw = Math.round(dm.widthPixels * 0.78);
    var taskKeys = ["food", "weapon", "ship", "war"];
    var cropNames = ["水稻", "玉米", "土豆", "西红柿", "胡萝卜", "卷心菜", "大豆"];
    floatWin = floaty.rawWindow(
        <frame id="panel_root" bg="#00000000">
            <card cardCornerRadius="12dp" cardElevation="2dp" cardBackgroundColor="#FFFFFF" w="*" h="auto">
                <vertical padding="0">
                <horizontal gravity="center_vertical" padding="14 12 10 10">
                    <frame id="title_dot" w="8" h="8" bg="#C7C7CC" margin="0 0 8 0" layout_gravity="center_vertical"/>
                    <text text="水世界辅助" textColor="#1C1C1E" textSize="14sp" textStyle="bold" layout_weight="1"/>
                    <text id="btn_close" text="&#10005;" textColor="#C7C7CC" textSize="14sp" padding="8 2 6 2"/>
                </horizontal>
                <vertical padding="14 2 14 6">
                    <text text="任务" textColor="#8E8E93" textSize="11sp" margin="0 0 8 0"/>
                    <horizontal id="tab_bar" margin="0 0 0 10">
                        <vertical id="tab_food" w="0" layout_weight="1" gravity="center" padding="6 4"
                                  foreground="?selectableItemBackground">
                            <text id="tab_food_t" text="种植" textSize="13sp" textColor="#A04468" gravity="center"/>
                            <frame id="tab_food_line" w="*" h="2dp" bg="#A04468" margin="6 3 6 0"/>
                        </vertical>
                        <vertical id="tab_weapon" w="0" layout_weight="1" gravity="center" padding="6 4"
                                  foreground="?selectableItemBackground">
                            <text id="tab_weapon_t" text="锻造" textSize="13sp" textColor="#8E8E93" gravity="center"/>
                            <frame id="tab_weapon_line" w="*" h="2dp" bg="#00000000" margin="6 3 6 0"/>
                        </vertical>
                        <vertical id="tab_ship" w="0" layout_weight="1" gravity="center" padding="6 4"
                                  foreground="?selectableItemBackground">
                            <text id="tab_ship_t" text="商船" textSize="13sp" textColor="#8E8E93" gravity="center"/>
                            <frame id="tab_ship_line" w="*" h="2dp" bg="#00000000" margin="6 3 6 0"/>
                        </vertical>
                        <vertical id="tab_war" w="0" layout_weight="1" gravity="center" padding="6 4"
                                  foreground="?selectableItemBackground">
                            <text id="tab_war_t" text="盟战" textSize="13sp" textColor="#8E8E93" gravity="center"/>
                            <frame id="tab_war_line" w="*" h="2dp" bg="#00000000" margin="6 3 6 0"/>
                        </vertical>
                    </horizontal>
                    <vertical id="set_food" w="*" margin="0 0 0 0">
                        <text text="作物" textColor="#8E8E93" textSize="11sp" margin="0 0 6 0"/>
                        <card id="food_selector" w="auto" h="auto" cardCornerRadius="8dp" cardElevation="0dp"
                              cardBackgroundColor="#F5F5F5" padding="12 10"
                              foreground="?selectableItemBackground">
                            <horizontal gravity="center_vertical">
                                <ImageView id="food_icon" w="24" h="24" scaleType="centerCrop" circle="true" margin="0 0 10 0"/>
                                <text id="food_label" text={panel.selectedFood} textColor="#1C1C1E" textSize="14sp" layout_weight="1"/>
                            </horizontal>
                        </card>
                        <text text="库存已满时自动切换作物" textColor="#C7C7CC" textSize="10sp" margin="4 2 0 6"/>
                        <horizontal gravity="center_vertical" margin="0 4 0 0">
                            <text text="频率" textColor="#8E8E93" textSize="12sp"/>
                            <card id="freq_food_btn" w="auto" h="auto" cardCornerRadius="8dp" cardElevation="0dp"
                                  cardBackgroundColor="#FFFFFF" padding="14 12" margin="12 0 0 0"
                                  foreground="?selectableItemBackground">
                                <text id="freq_food_t" text={panel.freq.food + "s"} textColor="#1C1C1E" textSize="18sp"/>
                            </card>
                        </horizontal>
                        <text text="商船" textColor="#8E8E93" textSize="11sp" margin="0 8 0 6"/>
                        <checkbox id="ship_cb_food" text="整点万吨商船" textSize="13sp" textColor="#1C1C1E"
                                  checked="false"/>
                        <checkbox id="ship_start_food" text="启动时就运行" textSize="12sp" textColor="#8E8E93"
                                  checked="false" margin="0 0 0 0" visibility="gone"/>
                    </vertical>
                    <vertical id="set_weapon" w="*" visibility="gone" margin="0 0 0 0">
                        <horizontal gravity="center_vertical" margin="0 0 6 0">
                            <text text="种类" textColor="#8E8E93" textSize="11sp"/>
                        </horizontal>
                        <horizontal gravity="center_vertical" margin="0 0 0 6">
                            <card id="wtype_gun" w="auto" h="auto" cardCornerRadius="8dp" cardElevation="0dp"
                                  cardBackgroundColor="#F5F5F5" padding="16 10" margin="0 0 8 0"
                                  foreground="?selectableItemBackground">
                                <text id="wtype_gun_t" text="枪械" textSize="16sp" textColor="#8E8E93"/>
                            </card>
                            <card id="wtype_armor" w="auto" h="auto" cardCornerRadius="8dp" cardElevation="0dp"
                                  cardBackgroundColor="#F5F5F5" padding="16 10" margin="0 0 8 0"
                                  foreground="?selectableItemBackground">
                                <text id="wtype_armor_t" text="防具" textSize="16sp" textColor="#8E8E93"/>
                            </card>
                            <card id="wtype_blade" w="auto" h="auto" cardCornerRadius="8dp" cardElevation="0dp"
                                  cardBackgroundColor="#F5F5F5" padding="16 10" margin="0 0 0 0"
                                  foreground="?selectableItemBackground">
                                <text id="wtype_blade_t" text="兵刃" textSize="16sp" textColor="#8E8E93"/>
                            </card>
                        </horizontal>
                        <horizontal gravity="center_vertical" margin="0 6 0 6">
                            <text text="级别" textColor="#8E8E93" textSize="11sp"/>
                        </horizontal>
                        <horizontal gravity="center_vertical" margin="0 0 0 8">
                            <card id="wlevel_blue" w="auto" h="auto" cardCornerRadius="8dp" cardElevation="0dp"
                                  cardBackgroundColor="#F5F5F5" padding="16 10" margin="0 0 8 0"
                                  foreground="?selectableItemBackground">
                                <text id="wlevel_blue_t" text="蓝级" textSize="16sp" textColor="#8E8E93"/>
                            </card>
                            <card id="wlevel_purple" w="auto" h="auto" cardCornerRadius="8dp" cardElevation="0dp"
                                  cardBackgroundColor="#F5F5F5" padding="16 10" margin="0 0 8 0"
                                  foreground="?selectableItemBackground">
                                <text id="wlevel_purple_t" text="紫级" textSize="16sp" textColor="#8E8E93"/>
                            </card>
                            <card id="wlevel_orange" w="auto" h="auto" cardCornerRadius="8dp" cardElevation="0dp"
                                  cardBackgroundColor="#F5F5F5" padding="16 10" margin="0 0 0 0"
                                  foreground="?selectableItemBackground">
                                <text id="wlevel_orange_t" text="橙级" textSize="16sp" textColor="#8E8E93"/>
                            </card>
                        </horizontal>
                        <horizontal gravity="center_vertical">
                            <text text="频率" textColor="#8E8E93" textSize="12sp"/>
                            <card id="freq_weapon_btn" w="auto" h="auto" cardCornerRadius="8dp" cardElevation="0dp"
                                  cardBackgroundColor="#FFFFFF" padding="14 12" margin="12 0 0 0"
                                  foreground="?selectableItemBackground">
                                <text id="freq_weapon_t" text={panel.freq.weapon + "s"} textColor="#1C1C1E" textSize="18sp"/>
                            </card>
                        </horizontal>
                        <text text="商船" textColor="#8E8E93" textSize="11sp" margin="0 8 0 6"/>
                        <checkbox id="ship_cb_weapon" text="整点万吨商船" textSize="13sp" textColor="#1C1C1E"
                                  checked="false"/>
                        <checkbox id="ship_start_weapon" text="启动时就运行" textSize="12sp" textColor="#8E8E93"
                                  checked="false" margin="0 0 0 0" visibility="gone"/>
                    </vertical>
                    <vertical id="set_ship" w="*" visibility="gone" margin="0 0 0 0">
                        <horizontal gravity="center_vertical" margin="0 0 6 0">
                            <text text="模式" textColor="#8E8E93" textSize="11sp" layout_weight="1"/>
                            <text text="8:00-22:00" textColor="#C7C7CC" textSize="10sp"/>
                        </horizontal>
                        <radiogroup id="ship_group" orientation="horizontal" margin="0 0 0 8">
                            <radio id="ship_once" text="整点一次" textSize="13sp" margin="0 0 14 0" checked="false"/>
                            <radio id="ship_repeat" text="持续检测" textSize="13sp" checked="false"/>
                        </radiogroup>
                        <horizontal gravity="center_vertical">
                            <text text="频率" textColor="#8E8E93" textSize="12sp"/>
                            <card id="freq_ship_btn" w="auto" h="auto" cardCornerRadius="8dp" cardElevation="0dp"
                                  cardBackgroundColor="#FFFFFF" padding="14 12" margin="12 0 0 0"
                                  foreground="?selectableItemBackground">
                                <text id="freq_ship_t" text={panel.freq.ship + "s"} textColor="#1C1C1E" textSize="18sp"/>
                            </card>
                        </horizontal>
                    </vertical>
                    <vertical id="set_war" w="*" visibility="gone" margin="0 0 0 0">
                        <horizontal gravity="center_vertical" margin="0 0 6 0">
                            <text text="模式" textColor="#8E8E93" textSize="11sp" layout_weight="1"/>
                            <text text="20:00-21:00" textColor="#C7C7CC" textSize="10sp"/>
                        </horizontal>
                        <radiogroup id="war_group" orientation="horizontal" margin="0 0 0 8">
                            <radio id="war_rally" text="集结" textSize="13sp" margin="0 0 14 0" checked="false"/>
                            <radio id="war_attack" text="进攻" textSize="13sp" margin="0 0 14 0" checked="false"/>
                            <radio id="war_defend" text="防守" textSize="13sp" checked="false"/>
                        </radiogroup>
                        <checkbox id="war_reward_cb" text="自动领取奖励" textSize="13sp" textColor="#1C1C1E"
                                  checked="true" margin="0 0 0 8"/>
                        <horizontal gravity="center_vertical">
                            <text text="频率" textColor="#8E8E93" textSize="12sp"/>
                            <card id="freq_war_btn" w="auto" h="auto" cardCornerRadius="8dp" cardElevation="0dp"
                                  cardBackgroundColor="#FFFFFF" padding="14 12" margin="12 0 0 0"
                                  foreground="?selectableItemBackground">
                                <text id="freq_war_t" text={panel.freq.war + "s"} textColor="#1C1C1E" textSize="18sp"/>
                            </card>
                        </horizontal>
                    </vertical>
                </vertical>
                <horizontal padding="14 10 14 6">
                    <card id="btn_run" w="0" layout_weight="1" h="auto" cardCornerRadius="10dp" cardElevation="0dp"
                          cardBackgroundColor={C.accent} margin="0 0 4 0"
                          foreground="?selectableItemBackground">
                        <text id="btn_run_t" text="&#9654; 运行" textColor="#FFFFFF" textSize="13sp"
                              gravity="center" textStyle="bold" padding="11 9"/>
                    </card>
                    <card id="btn_log" w="0" layout_weight="1" h="auto" cardCornerRadius="10dp" cardElevation="0dp"
                          cardBackgroundColor="#F5F5F5" margin="4 0 0 0"
                          foreground="?selectableItemBackground">
                        <text text="日志" textColor="#636366" textSize="13sp"
                              gravity="center" padding="11 9"/>
                    </card>
                </horizontal>
                </vertical>
            </card>
        </frame>
    );
    floatWin.setSize(pw, -2);
    floatWin.setPosition(Math.round((dm.widthPixels - pw) / 2), dp(200));

    // 加载作物图标
    var cropIconBitmaps = {};
    for (var ci = 0; ci < cropNames.length; ci++) {
        try {
            var iconImg = images.read("./img/种子图标/" + cropNames[ci] + ".png");
            if (iconImg) cropIconBitmaps[cropNames[ci]] = iconImg.getBitmap();
        } catch(e) {}
    }
    panel._cropIconBitmaps = cropIconBitmaps;
    function updateFoodIcon(name) {
        try {
            if (cropIconBitmaps[name]) floatWin.food_icon.setImageBitmap(cropIconBitmaps[name]);
        } catch(e) {}
    }
    updateFoodIcon(panel.selectedFood);

    // 恢复设置区显隐
    panel.showTaskSettings(panel.currentTask);

    // 恢复任务 tab 高亮
    panel._updateTabHighlight();

    // 恢复 radio 选中状态 & 设置颜色
    try { floatWin["ship_" + panel.selectedShipMode].setChecked(true); } catch(e) {}
    try { floatWin["war_" + panel.selectedWarMode].setChecked(true); } catch(e) {}

    // 设置 radio 按钮颜色（选中 accent，未选中灰色）
    var accentColor = colors.parseColor("#A04468");
    var grayColor = colors.parseColor("#C7C7CC");
    var csl = new android.content.res.ColorStateList(
        [[android.R.attr.state_checked], []],
        [accentColor, grayColor]
    );
    var radioIds = ["ship_once", "ship_repeat", "war_rally", "war_attack", "war_defend"];
    for (var si = 0; si < radioIds.length; si++) {
        try { floatWin[radioIds[si]].setButtonTintList(csl); } catch(e) {}
    }

    // checkbox 颜色
    try { floatWin.war_reward_cb.setButtonTintList(csl); } catch(e) {}
    var shipCbIds = ["ship_cb_food", "ship_start_food", "ship_cb_weapon", "ship_start_weapon"];
    for (var sc = 0; sc < shipCbIds.length; sc++) {
        try { floatWin[shipCbIds[sc]].setButtonTintList(csl); } catch(e) {}
    }

    // 恢复 checkbox 状态（在绑定 click 之前）
    try { floatWin.war_reward_cb.setChecked(panel.warClaimReward); } catch(e) {}
    try { floatWin.ship_cb_food.setChecked(panel.shipInFood); } catch(e) {}
    try { floatWin.ship_cb_weapon.setChecked(panel.shipInFood); } catch(e) {}
    try { floatWin.ship_start_food.setChecked(panel.shipRunOnStart); } catch(e) {}
    try { floatWin.ship_start_weapon.setChecked(panel.shipRunOnStart); } catch(e) {}
    try {
        var shipStartVis = panel.shipInFood ? android.view.View.VISIBLE : android.view.View.GONE;
        floatWin.ship_start_food.setVisibility(shipStartVis);
        floatWin.ship_start_weapon.setVisibility(shipStartVis);
    } catch(e) {}

    // checkbox click 恢复状态（on("check") 在 rawWindow 中不可靠）
    floatWin.war_reward_cb.on("click", function() {
        try { panel.warClaimReward = floatWin.war_reward_cb.isChecked(); panel._saveConfig(); } catch(e) {}
    });

    // 整点万吨商船 checkbox 同步
    var _shipSyncing = false;
    floatWin.ship_cb_food.on("click", function() {
        if (_shipSyncing) return;
        _shipSyncing = true;
        try {
            var checked = floatWin.ship_cb_food.isChecked();
            panel.shipInFood = checked;
            floatWin.ship_start_food.setVisibility(checked ? android.view.View.VISIBLE : android.view.View.GONE);
            floatWin.ship_cb_weapon.setChecked(checked);
            floatWin.ship_start_weapon.setVisibility(checked ? android.view.View.VISIBLE : android.view.View.GONE);
            panel._saveConfig();
        } catch(e) {}
        _shipSyncing = false;
    });
    floatWin.ship_cb_weapon.on("click", function() {
        if (_shipSyncing) return;
        _shipSyncing = true;
        try {
            var checked = floatWin.ship_cb_weapon.isChecked();
            panel.shipInFood = checked;
            floatWin.ship_start_weapon.setVisibility(checked ? android.view.View.VISIBLE : android.view.View.GONE);
            floatWin.ship_cb_food.setChecked(checked);
            floatWin.ship_start_food.setVisibility(checked ? android.view.View.VISIBLE : android.view.View.GONE);
            panel._saveConfig();
        } catch(e) {}
        _shipSyncing = false;
    });
    floatWin.ship_start_food.on("click", function() {
        if (_shipSyncing) return;
        _shipSyncing = true;
        try {
            var checked = floatWin.ship_start_food.isChecked();
            panel.shipRunOnStart = checked;
            floatWin.ship_start_weapon.setChecked(checked);
            panel._saveConfig();
        } catch(e) {}
        _shipSyncing = false;
    });
    floatWin.ship_start_weapon.on("click", function() {
        if (_shipSyncing) return;
        _shipSyncing = true;
        try {
            var checked = floatWin.ship_start_weapon.isChecked();
            panel.shipRunOnStart = checked;
            floatWin.ship_start_food.setChecked(checked);
            panel._saveConfig();
        } catch(e) {}
        _shipSyncing = false;
    });

    // 任务 tab 选择
    var taskKeys = ["food", "weapon", "ship", "war"];
    for (var ti = 0; ti < taskKeys.length; ti++) {
        (function(key) {
            floatWin["tab_" + key].on("click", function() {
                if (panel.running) return;
                if (key !== panel.currentTask) {
                    panel.currentTask = key;
                    panel.showTaskSettings(key);
                    panel._updateTabHighlight();
                    panel._saveConfig();
                    ctx.onTaskChange(key);
                }
            });
        })(taskKeys[ti]);
    }

    // 商船模式选择
    floatWin.ship_once.on("click", function() {
        if (panel.running) return;
        if (panel.selectedShipMode !== "once") {
            panel.selectedShipMode = "once";
            panel._saveConfig();
            ctx.onShipModeChange("once");
        }
    });
    floatWin.ship_repeat.on("click", function() {
        if (panel.running) return;
        if (panel.selectedShipMode !== "repeat") {
            panel.selectedShipMode = "repeat";
            panel._saveConfig();
            ctx.onShipModeChange("repeat");
        }
    });

    // 盟战模式选择
    floatWin.war_rally.on("click", function() {
        if (panel.running) return;
        if (panel.selectedWarMode !== "rally") {
            panel.selectedWarMode = "rally";
            panel._saveConfig();
            ctx.onWarModeChange("rally");
        }
    });
    floatWin.war_attack.on("click", function() {
        if (panel.running) return;
        if (panel.selectedWarMode !== "attack") {
            panel.selectedWarMode = "attack";
            panel._saveConfig();
            ctx.onWarModeChange("attack");
        }
    });
    floatWin.war_defend.on("click", function() {
        if (panel.running) return;
        if (panel.selectedWarMode !== "defend") {
            panel.selectedWarMode = "defend";
            panel._saveConfig();
            ctx.onWarModeChange("defend");
        }
    });

    // 锻造种类选择
    var weaponTypes = [
        { id: "wtype_gun", val: "枪械" },
        { id: "wtype_armor", val: "防具" },
        { id: "wtype_blade", val: "兵刃" }
    ];
    var weaponLevels = [
        { id: "wlevel_blue", val: "蓝级" },
        { id: "wlevel_purple", val: "紫级" },
        { id: "wlevel_orange", val: "橙级" }
    ];
    function updateWeaponHighlight() {
        for (var i = 0; i < weaponTypes.length; i++) {
            try {
                var sel = weaponTypes[i].val === panel.weaponType;
                floatWin[weaponTypes[i].id].setCardBackgroundColor(colors.parseColor(sel ? "#E8D5E0" : "#F5F5F5"));
                floatWin[weaponTypes[i].id + "_t"].setTextColor(colors.parseColor(sel ? "#A04468" : "#8E8E93"));
            } catch(e) {}
        }
        for (var j = 0; j < weaponLevels.length; j++) {
            try {
                var sel2 = weaponLevels[j].val === panel.weaponLevel;
                floatWin[weaponLevels[j].id].setCardBackgroundColor(colors.parseColor(sel2 ? "#E8D5E0" : "#F5F5F5"));
                floatWin[weaponLevels[j].id + "_t"].setTextColor(colors.parseColor(sel2 ? "#A04468" : "#8E8E93"));
            } catch(e) {}
        }
    }
    updateWeaponHighlight();
    for (var wi = 0; wi < weaponTypes.length; wi++) {
        (function(item) {
            floatWin[item.id].on("click", function() {
                if (panel.running) return;
                if (panel.weaponType !== item.val) {
                    panel.weaponType = item.val;
                    panel._saveConfig();
                    updateWeaponHighlight();
                }
            });
        })(weaponTypes[wi]);
    }
    for (var wj = 0; wj < weaponLevels.length; wj++) {
        (function(item) {
            floatWin[item.id].on("click", function() {
                if (panel.running) return;
                if (panel.weaponLevel !== item.val) {
                    panel.weaponLevel = item.val;
                    panel._saveConfig();
                    updateWeaponHighlight();
                }
            });
        })(weaponLevels[wj]);
    }

    // 运行中禁用控件
    if (panel.running) {
        var tabKeys = ["food", "weapon", "ship", "war"];
        for (var ti2 = 0; ti2 < tabKeys.length; ti2++) {
            try { floatWin["tab_" + tabKeys[ti2]].setClickable(false); } catch(e) {}
        }
        var modeRadios = ["ship_once", "ship_repeat", "war_attack", "war_defend"];
        for (var ri = 0; ri < modeRadios.length; ri++) {
            try { floatWin[modeRadios[ri]].setEnabled(false); } catch(e) {}
        }
    }

    // 作物选择（弹窗单选）
    floatWin.food_selector.on("click", function() {
        dialogs.select("选择作物", cropNames, function(idx) {
            if (idx >= 0) {
                panel.selectedFood = cropNames[idx];
                panel._saveConfig();
                ctx.onFoodChange(cropNames[idx]);
                try { floatWin.food_label.setText(cropNames[idx]); } catch(e) {}
                updateFoodIcon(cropNames[idx]);
            }
        });
    });

    // 频率点击编辑
    var freqKeys = ["food", "weapon", "ship", "war"];
    for (var fi = 0; fi < freqKeys.length; fi++) {
        (function(key) {
            floatWin["freq_" + key + "_btn"].on("click", function() {
                if (panel.running) return;
                var current = panel.freq[key];
                dialogs.rawInput("频率 (秒)", current + "", function(val) {
                    if (!val) return;
                    var cleaned = val.replace(/[^0-9]/g, "");
                    var num = parseInt(cleaned);
                    if (num > 0 && num < 3600) {
                        panel.freq[key] = num;
                        panel._saveConfig();
                        try { floatWin["freq_" + key + "_t"].setText(num + "s"); } catch(e) {}
                    }
                });
            });
        })(freqKeys[fi]);
    }

    floatWin.btn_close.on("click", function() { panel.showBall(ctx); });
    floatWin.btn_run.on("click", function() {
        if (panel.running) ctx.onStop(); else ctx.onRun();
    });
    floatWin.btn_log.on("click", function() {
        console.show();
        panel.showBall(ctx);
    });
    var tx, ty, wx, wy;
    floatWin.panel_root.setOnTouchListener(function(v, e) {
        switch(e.getAction()) {
            case 0: tx = e.getRawX(); ty = e.getRawY(); wx = floatWin.getX(); wy = floatWin.getY(); break;
            case 2:
                var nx = Math.max(0, Math.min(dm.widthPixels - pw, wx + (e.getRawX()-tx)));
                var ny = Math.max(-statusBarH, Math.min(dm.heightPixels - statusBarH - dp(60), wy + (e.getRawY()-ty)));
                floatWin.setPosition(nx, ny);
                break;
        }
        return false;
    });
    if (panel.running) {
        panel.setRunningUI(true, C);
    }
};

panel._updateTabHighlight = function() {
    if (!floatWin) return;
    var keys = ["food", "weapon", "ship", "war"];
    for (var i = 0; i < keys.length; i++) {
        var isSel = keys[i] === panel.currentTask;
        try {
            floatWin["tab_" + keys[i] + "_t"].setTextColor(colors.parseColor(isSel ? "#A04468" : "#8E8E93"));
            floatWin["tab_" + keys[i] + "_line"].setBackgroundColor(colors.parseColor(isSel ? "#A04468" : "#00000000"));
        } catch(e) {}
    }
};

panel.showTaskSettings = function(task) {
    if (!floatWin) return;
    var tasks = ["food", "weapon", "ship", "war"];
    for (var i = 0; i < tasks.length; i++) {
        try {
            floatWin["set_" + tasks[i]].setVisibility(tasks[i] === task ? android.view.View.VISIBLE : android.view.View.GONE);
        } catch(e) {}
    }
    // 更新"启动时就运行"可见性
    try {
        var startVis = panel.shipInFood ? android.view.View.VISIBLE : android.view.View.GONE;
        if (floatWin.ship_start_food) floatWin.ship_start_food.setVisibility(startVis);
        if (floatWin.ship_start_weapon) floatWin.ship_start_weapon.setVisibility(startVis);
    } catch(e) {}
};

panel.setRunningUI = function(running, C) {
    panel.running = running;
    if (!floatWin) return;
    $ui.run(function() {
        try {
            floatWin.btn_run.setCardBackgroundColor(colors.parseColor(running ? C.error : C.accent));
            floatWin.btn_run_t.setText(running ? "■ 停止" : "▶ 运行");
            floatWin.btn_run_t.setTextColor(colors.parseColor("#FFFFFF"));
            floatWin.title_dot.setBackgroundColor(colors.parseColor(running ? C.green : "#C7C7CC"));
            // 禁用/启用任务 tab
            var tabKeys = ["food", "weapon", "ship", "war"];
            for (var i = 0; i < tabKeys.length; i++) {
                try { floatWin["tab_" + tabKeys[i]].setClickable(!running); } catch(e) {}
            }
            // 禁用/启用模式 radio
            var radioIds = ["ship_once", "ship_repeat", "war_rally", "war_attack", "war_defend"];
            for (var r = 0; r < radioIds.length; r++) {
                try { floatWin[radioIds[r]].setEnabled(!running); } catch(e) {}
            }
            var clickIds = ["food_selector", "freq_food_btn", "freq_weapon_btn", "freq_ship_btn", "freq_war_btn", "war_reward_cb", "ship_cb_food", "ship_start_food", "ship_cb_weapon", "ship_start_weapon", "wtype_gun", "wtype_armor", "wtype_blade", "wlevel_blue", "wlevel_purple", "wlevel_orange"];
            for (var j = 0; j < clickIds.length; j++) {
                try { floatWin[clickIds[j]].setClickable(!running); } catch(e) {}
            }
        } catch(e) {}
    });
};

panel.getCountText = function() { return null; };

panel.readFreqs = function() {
    return panel.freq;
};

panel.updateFoodLabel = function(food) {
    $ui.run(function() {
        try {
            if (floatWin && floatWin.food_label) floatWin.food_label.setText(food);
            var cropIconBitmaps = panel._cropIconBitmaps;
            if (cropIconBitmaps && cropIconBitmaps[food] && floatWin.food_icon) {
                floatWin.food_icon.setImageBitmap(cropIconBitmaps[food]);
            }
        } catch(e) {}
    });
};

module.exports = panel;
