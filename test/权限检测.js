// test/权限检测.js — 权限和设备信息检测测试

toast("开始检测...");
sleep(1000);

// ===== 分辨率 =====
try {
    var wm = context.getSystemService(android.content.Context.WINDOW_SERVICE);
    var display = wm.getDefaultDisplay();
    var realDm = new android.util.DisplayMetrics();
    display.getRealMetrics(realDm);
    log("分辨率: " + realDm.widthPixels + " × " + realDm.heightPixels);
} catch(e) {
    log("分辨率检测失败: " + e);
}
log("device.width: " + device.width);
log("device.height: " + device.height);

// ===== 应用列表权限 =====
try {
    var list = context.getPackageManager().getInstalledPackages(0);
    log("getInstalledPackages 数量: " + list.size());
    log("应用列表权限: " + (list.size() > 1 ? "已开启" : "未开启"));
} catch(e) {
    log("应用列表权限检测失败: " + e);
}

// ===== 无障碍权限（AutoJs6） =====
try {
    var accStr = android.provider.Settings.Secure.getString(
        context.getContentResolver(),
        android.provider.Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
    );
    log("ENABLED_ACCESSIBILITY_SERVICES: " + accStr);
    var accOk = accStr != null && accStr.toLowerCase().indexOf("autojs") >= 0;
    log("AutoJs6 无障碍: " + (accOk ? "已开启" : "未开启"));
} catch(e) {
    log("无障碍检测失败: " + e);
}

// ===== 后台弹出权限 =====
try {
    var appOps = context.getSystemService(android.content.Context.APP_OPS_SERVICE);
    var opCode = android.app.AppOpsManager.OP_SYSTEM_ALERT_WINDOW;
    var mode = appOps.checkOpNoThrow(opCode, android.os.Process.myUid(), context.getPackageName());
    log("后台弹出 mode: " + mode + " (ALLOWED=" + android.app.AppOpsManager.MODE_ALLOWED + ")");
} catch(e) {
    log("后台弹出检测失败: " + e);
}

// ===== 悬浮窗权限 =====
try {
    var overlayOk = android.provider.Settings.canDrawOverlays(context);
    log("悬浮窗权限: " + overlayOk);
} catch(e) {
    log("悬浮窗检测失败: " + e);
}

toast("检测完毕，查看日志");
