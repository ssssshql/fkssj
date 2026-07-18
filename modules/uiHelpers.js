// uiHelpers.js — 日志、统计、导航、图标

var helpers = {};

var logEntries = [];

helpers.getLogEntries = function() { return logEntries; };

helpers.timeStr = function(d) {
    return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0') + ':' + String(d.getSeconds()).padStart(2,'0');
};

helpers.dateStr = function(d) {
    return (d.getMonth()+1) + '/' + d.getDate() + ' ' + helpers.timeStr(d);
};

helpers.appendLog = function(msg) {
    var line = helpers.timeStr(new Date()) + "  " + msg;
    log(line);
    logEntries.push(line);
    if (logEntries.length > 30) logEntries.shift();
    $ui.run(function() {
        try {
            $ui.txt_log.setText(logEntries.join("\n"));
            $ui.post(function() { $ui.log_scroll.fullScroll(android.view.View.FOCUS_DOWN); });
        } catch(e) {}
    });
};

helpers.updateStats = function(taskKey, stats) {
    $ui.run(function() {
        try {
            if (stats && taskKey) {
                if ($ui["stat_" + taskKey]) $ui["stat_" + taskKey].setText(String(stats[taskKey] || 0));
            }
        } catch(e) {}
    });
};

helpers.initStats = function(stats) {
    $ui.run(function() {
        var keys = ["food", "weapon", "ship", "war"];
        for (var i = 0; i < keys.length; i++) {
            try {
                if ($ui["stat_" + keys[i]]) $ui["stat_" + keys[i]].setText(String(stats[keys[i]] || 0));
            } catch(e) {}
        }
    });
};

helpers.switchNav = function(nav, currentNav, C) {
    var pages = ["home", "redeem", "about"];
    for (var i = 0; i < pages.length; i++) {
        var p = pages[i];
        try {
            $ui["page_" + p].setVisibility(p === nav ? android.view.View.VISIBLE : android.view.View.GONE);
            var active = (p === nav);
            $ui["nav_" + p].setCardBackgroundColor(colors.parseColor(active ? C.accent : C.bg));
            $ui["nav_" + p + "_icon"].setTextColor(colors.parseColor(active ? "#FFFFFF" : C.textMuted));
        } catch(e) {}
    }
};

helpers.buildRedeemList = function(redeemCodes, C, dateStrFn) {
    for (var i = 0; i < redeemCodes.length; i++) {
        (function(idx) {
            var rc = redeemCodes[idx];
            var xml = '<card cardCornerRadius="10dp" cardElevation="0dp" cardBackgroundColor="' + C.card + '" margin="0 0 0 8">';
            xml += '<horizontal padding="14 12" gravity="center_vertical">';
            xml += '<vertical layout_weight="1">';
            xml += '<text text="' + rc.code + '" textColor="' + C.textPrimary + '" textSize="14sp" typeface="monospace" textStyle="bold"/>';
            xml += '<text text="' + rc.desc + '  ·  ' + dateStrFn(rc.time) + '" textColor="' + C.textSecondary + '" textSize="11sp" margin="0 2 0 0"/>';
            xml += '</vertical>';
            xml += '<text text="复制" textColor="' + C.accent + '" textSize="12sp" textStyle="bold" padding="6 4"/>';
            xml += '</horizontal></card>';
            var row = $ui.inflate(xml, $ui.redeem_list, false);
            var hor = row.getChildAt(0);
            var copyBtn = hor.getChildAt(1);
            copyBtn.on("click", function() {
                setClip(rc.code);
                toast("已复制: " + rc.code);
            });
            $ui.redeem_list.addView(row);
        })(i);
    }
};

helpers.initCircleIcon = function(iv, srcBitmap) {
    try {
        iv.post(function() {
            var size = iv.getWidth();
            if (!size) return;
            var output = android.graphics.Bitmap.createBitmap(size, size, android.graphics.Bitmap.Config.ARGB_8888);
            var canvas = new android.graphics.Canvas(output);
            var paint = new Paint();
            paint.setAntiAlias(true);
            var shader = new android.graphics.BitmapShader(srcBitmap, android.graphics.Shader.TileMode.CLAMP, android.graphics.Shader.TileMode.CLAMP);
            var matrix = new android.graphics.Matrix();
            var scale = Math.max(size / srcBitmap.getWidth(), size / srcBitmap.getHeight());
            matrix.setScale(scale, scale);
            var dx = (size - srcBitmap.getWidth() * scale) / 2;
            var dy = (size - srcBitmap.getHeight() * scale) / 2;
            matrix.postTranslate(dx, dy);
            shader.setLocalMatrix(matrix);
            paint.setShader(shader);
            canvas.drawCircle(size / 2, size / 2, size / 2, paint);
            iv.setImageBitmap(output);
        });
    } catch(e) {}
};

module.exports = helpers;
