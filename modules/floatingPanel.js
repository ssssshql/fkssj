// floatingPanel.js — 悬浮球 + 控制面板

var panel = {};
var floatWin = null;

// 状态存储在模块上，避免跨上下文丢失
panel.selectedFood = "";
panel.selectedShipMode = "once";
panel.selectedWarMode = "attack";
panel.running = false;
panel.runCount = 0;
panel.currentTab = "food";

function closeFloat() { if (floatWin) { floatWin.close(); floatWin = null; } }
panel.closeFloat = closeFloat;

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
        var glowColor = panel.running ? "#33FF3B30" : "#33A04468";
        var glowColor2 = panel.running ? "#1AFF3B30" : "#1AA04468";
        var ringColor = panel.running ? "#66FF3B30" : "#66A04468";
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
    floatWin.setPosition(dm.widthPixels - total - dp(6), dp(74));
    var tx, ty, wx, wy, moved;
    floatWin.root.setOnTouchListener(function(v, e) {
        switch(e.getAction()) {
            case 0: tx = e.getRawX(); ty = e.getRawY(); wx = floatWin.getX(); wy = floatWin.getY(); moved = false; break;
            case 2: if (Math.abs(e.getRawX()-tx) > 8 || Math.abs(e.getRawY()-ty) > 8) moved = true; floatWin.setPosition(wx + (e.getRawX()-tx), wy + (e.getRawY()-ty)); break;
            case 1: if (!moved) panel.expandPanel(ctx); break;
        }
        return true;
    });
    ctx.appendLog("悬浮球已就绪");
};

panel.expandPanel = function(ctx) {
    closeFloat();
    var C = ctx.C;
    var dm = context.getResources().getDisplayMetrics();
    var pw = Math.round(dm.widthPixels * 0.8);
    floatWin = floaty.rawWindow(
        <frame id="panel_root" bg="#00000000">
            <card cardCornerRadius="16dp" cardElevation="4dp" cardBackgroundColor={C.card} w="*" h="auto">
                <vertical padding="0">
                <horizontal id="title_bar" gravity="center_vertical" bg={C.accentDim} padding="18 16 14 16">
                    <text text="水世界辅助" textColor="#FFFFFF" textSize="15sp" textStyle="bold" layout_weight="1"/>
                    <text id="btn_close" text="&#10005;" textColor="#FFFFFF" textSize="16sp" padding="10 4 4 4"/>
                </horizontal>
                <horizontal padding="14 14 14 10">
                    <card id="tab_food" w="0" layout_weight="1" h="auto" cardCornerRadius="10dp"
                          cardElevation="0dp" cardBackgroundColor={C.bg} margin="0 0 5 0"
                          foreground="?selectableItemBackground">
                        <text id="tab_food_t" text="种植" textColor={C.textSecondary} textSize="12sp" gravity="center" padding="9 6"/>
                    </card>
                    <card id="tab_weapon" w="0" layout_weight="1" h="auto" cardCornerRadius="10dp"
                          cardElevation="0dp" cardBackgroundColor={C.bg} margin="5 0 5 0"
                          foreground="?selectableItemBackground">
                        <text id="tab_weapon_t" text="锻造" textColor={C.textSecondary} textSize="12sp" gravity="center" padding="9 6"/>
                    </card>
                    <card id="tab_ship" w="0" layout_weight="1" h="auto" cardCornerRadius="10dp"
                          cardElevation="0dp" cardBackgroundColor={C.bg} margin="5 0 5 0"
                          foreground="?selectableItemBackground">
                        <text id="tab_ship_t" text="商船" textColor={C.textSecondary} textSize="12sp" gravity="center" padding="9 6"/>
                    </card>
                    <card id="tab_war" w="0" layout_weight="1" h="auto" cardCornerRadius="10dp"
                          cardElevation="0dp" cardBackgroundColor={C.bg} margin="5 0 0 0"
                          foreground="?selectableItemBackground">
                        <text id="tab_war_t" text="盟战" textColor={C.textSecondary} textSize="12sp" gravity="center" padding="9 6"/>
                    </card>
                </horizontal>
                <vertical padding="14 14 14 10">
                    <vertical id="set_food">
                        <text text="选择作物" textColor={C.textMuted} textSize="11sp" margin="0 0 8 0"/>
                        <card id="food_selector" w="*" h="auto" cardCornerRadius="10dp" cardElevation="0dp"
                              cardBackgroundColor={C.bg} padding="14 14"
                              foreground="?selectableItemBackground">
                            <horizontal gravity="center_vertical">
                                <text id="food_label" text={panel.selectedFood} textColor={C.textPrimary} textSize="14sp" layout_weight="1"/>
                                <text text="&#9662;" textColor={C.textMuted} textSize="14sp"/>
                            </horizontal>
                        </card>
                    </vertical>
                    <vertical id="set_weapon" visibility="gone"/>
                    <vertical id="set_ship" visibility="gone">
                        <text text="运行模式" textColor={C.textMuted} textSize="11sp" margin="0 0 8 0"/>
                        <card id="ship_mode_selector" w="*" h="auto" cardCornerRadius="10dp" cardElevation="0dp"
                              cardBackgroundColor={C.bg} padding="14 14"
                              foreground="?selectableItemBackground">
                            <horizontal gravity="center_vertical">
                                <text id="ship_mode_label" text={panel.selectedShipMode === "repeat" ? "持续检测" : "整点一次"} textColor={C.textPrimary} textSize="14sp" layout_weight="1"/>
                                <text text="&#9662;" textColor={C.textMuted} textSize="14sp"/>
                            </horizontal>
                        </card>
                    </vertical>
                    <vertical id="set_war" visibility="gone">
                        <text text="战斗模式" textColor={C.textMuted} textSize="11sp" margin="0 0 8 0"/>
                        <card id="war_mode_selector" w="*" h="auto" cardCornerRadius="10dp" cardElevation="0dp"
                              cardBackgroundColor={C.bg} padding="14 14"
                              foreground="?selectableItemBackground">
                            <horizontal gravity="center_vertical">
                                <text id="war_mode_label" text={panel.selectedWarMode === "defend" ? "防守" : "进攻"} textColor={C.textPrimary} textSize="14sp" layout_weight="1"/>
                                <text text="&#9662;" textColor={C.textMuted} textSize="14sp"/>
                            </horizontal>
                        </card>
                    </vertical>
                </vertical>
                <card id="btn_run" w="*" h="auto" cardCornerRadius="10dp" cardElevation="0dp"
                      cardBackgroundColor={C.accent} margin="14 0 14 10"
                      foreground="?selectableItemBackground">
                    <text id="btn_run_t" text="&#9654;  运行" textColor="#FFFFFF" textSize="14sp"
                          gravity="center" textStyle="bold" padding="14 8"/>
                </card>
                <horizontal padding="14 6 14 16" gravity="center_vertical">
                    <frame id="dot" w="7" h="7" bg={C.textMuted} margin="0 10 0 0"/>
                    <text id="status_t" text="就绪" textColor={C.textMuted} textSize="11sp" layout_weight="1"/>
                    <text id="count_t" text="" textColor={C.textMuted} textSize="11sp"/>
                </horizontal>
                </vertical>
            </card>
        </frame>
    );
    floatWin.setSize(pw, -2);
    floatWin.setPosition(Math.round((dm.widthPixels - pw) / 2), ctx.dp(200));

    // 恢复上次选中的 Tab
    panel.switchTab(panel.currentTab, C);

    floatWin.tab_food.on("click", function() { panel.currentTab = "food"; panel.switchTab("food", C); ctx.onTabChange("food"); });
    floatWin.tab_weapon.on("click", function() { panel.currentTab = "weapon"; panel.switchTab("weapon", C); ctx.onTabChange("weapon"); });
    floatWin.tab_ship.on("click", function() { panel.currentTab = "ship"; panel.switchTab("ship", C); ctx.onTabChange("ship"); });
    floatWin.tab_war.on("click", function() { panel.currentTab = "war"; panel.switchTab("war", C); ctx.onTabChange("war"); });
    floatWin.food_selector.on("click", function() {
        dialogs.select("选择作物", ctx.foodOptions, function(idx) {
            if (idx >= 0) {
                panel.selectedFood = ctx.foodOptions[idx];
                ctx.onFoodChange(ctx.foodOptions[idx]);
                try { floatWin.food_label.setText(panel.selectedFood); } catch(e) {}
            }
        });
    });
    floatWin.ship_mode_selector.on("click", function() {
        var modes = ["整点一次", "持续检测"];
        var keys = ["once", "repeat"];
        dialogs.select("运行模式", modes, function(idx) {
            if (idx >= 0) {
                panel.selectedShipMode = keys[idx];
                ctx.onShipModeChange(keys[idx]);
                try { floatWin.ship_mode_label.setText(modes[idx]); } catch(e) {}
            }
        });
    });
    floatWin.war_mode_selector.on("click", function() {
        var modes = ["进攻", "防守"];
        var keys = ["attack", "defend"];
        dialogs.select("战斗模式", modes, function(idx) {
            if (idx >= 0) {
                panel.selectedWarMode = keys[idx];
                ctx.onWarModeChange(keys[idx]);
                try { floatWin.war_mode_label.setText(modes[idx]); } catch(e) {}
            }
        });
    });
    floatWin.btn_close.on("click", function() { panel.showBall(ctx); });
    floatWin.btn_run.on("click", function() {
        if (panel.running) ctx.onStop(); else ctx.onRun();
    });
    var tx, ty, wx, wy;
    floatWin.title_bar.setOnTouchListener(function(v, e) {
        switch(e.getAction()) {
            case 0: tx = e.getRawX(); ty = e.getRawY(); wx = floatWin.getX(); wy = floatWin.getY(); break;
            case 2: floatWin.setPosition(wx + (e.getRawX()-tx), wy + (e.getRawY()-ty)); break;
        }
        return false;
    });
    if (panel.running) {
        panel.setRunningUI(true, C);
        try { floatWin.count_t.setText("第 " + panel.runCount + " 次"); } catch(e) {}
    }
};

panel.switchTab = function(tab, C) {
    var tabs = ["food", "weapon", "ship", "war"];
    for (var i = 0; i < tabs.length; i++) {
        var active = (tabs[i] === tab);
        try {
            floatWin["tab_" + tabs[i]].setCardBackgroundColor(colors.parseColor(active ? C.accent : C.bg));
            floatWin["tab_" + tabs[i] + "_t"].setTextColor(colors.parseColor(active ? "#FFFFFF" : C.textSecondary));
            floatWin["set_" + tabs[i]].setVisibility(active ? android.view.View.VISIBLE : android.view.View.GONE);
        } catch(e) {}
    }
};

panel.setRunningUI = function(running, C) {
    panel.running = running;
    if (!floatWin) return;
    $ui.run(function() {
        try {
            floatWin.btn_run.setCardBackgroundColor(colors.parseColor(running ? C.error : C.accent));
            floatWin.btn_run_t.setText(running ? "■  停止" : "▶  运行");
            floatWin.btn_run_t.setTextColor(colors.parseColor("#FFFFFF"));
            floatWin.status_t.setText(running ? "运行中" : "就绪");
            floatWin.status_t.setTextColor(colors.parseColor(running ? C.accent : C.textMuted));
            floatWin.dot.setBackgroundColor(colors.parseColor(running ? C.green : C.textMuted));
        } catch(e) {}
    });
};

panel.getCountText = function() {
    try { return floatWin && floatWin.count_t ? floatWin.count_t : null; } catch(e) { return null; }
};

panel.updateFoodLabel = function(food) {
    $ui.run(function() {
        try { if (floatWin && floatWin.food_label) floatWin.food_label.setText(food); } catch(e) {}
    });
};

module.exports = panel;
