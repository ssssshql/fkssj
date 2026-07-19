// test/权限操作测试.js — 测试各种直接操作权限的方法

var gh = require("/sdcard/脚本/fkssj/modules/gameHelper.js");

log("=== 权限操作能力测试 ===\n");

// 1. 悬浮窗权限 — AppOpsManager
log("--- 悬浮窗权限 (SYSTEM_ALERT_WINDOW) ---");
try {
    var appOps = context.getSystemService(android.content.Context.APP_OPS_SERVICE);
    var uid = android.os.Process.myUid();
    var pkg = context.getPackageName();

    // 读取当前模式
    var currentMode = appOps.checkOpNoThrow(24, uid, pkg);
    log("当前模式: " + currentMode + " (0=允许, 1=忽略, 2=拒绝)");

    // 尝试 setMode（写回原值，不实际修改）
    appOps.setMode(24, uid, pkg, currentMode);
    log("AppOps.setMode: ✓ 成功");
} catch(e) {
    log("AppOps.setMode: ✗ 失败 - " + e);
}

// 2. 无障碍权限 — Settings.Secure 写入
log("\n--- 无障碍权限 (WRITE_SECURE_SETTINGS) ---");
try {
    var resolver = context.getContentResolver();
    var accStr = android.provider.Settings.Secure.getString(resolver, android.provider.Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
    log("当前服务: " + (accStr || "(空)"));

    // 写回原值
    android.provider.Settings.Secure.putString(resolver, android.provider.Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES, accStr || "");
    log("Settings.Secure.putString: ✓ 成功");
} catch(e) {
    log("Settings.Secure.putString: ✗ 失败 - " + e);
}

// 3. 应用列表权限 — AppOpsManager
log("\n--- 应用列表权限 ---");
try {
    var appOps = context.getSystemService(android.content.Context.APP_OPS_SERVICE);
    var uid = android.os.Process.myUid();
    var pkg = context.getPackageName();

    // 尝试各种可能的 op code
    var tryOps = [
        {code: 10058, name: "OP_GET_INSTALLED_APPS"},
        {code: 77, name: "OP_QUERY_ALL_PACKAGES"},
        {code: 43, name: "OP_GET_USAGE_STATS"},
        {code: 24, name: "OP_SYSTEM_ALERT_WINDOW"},
        {code: 10021, name: "OP_BACKGROUND_START_ACTIVITY"}
    ];
    for (var i = 0; i < tryOps.length; i++) {
        try {
            var mode = appOps.checkOpNoThrow(tryOps[i].code, uid, pkg);
            log(tryOps[i].name + " (" + tryOps[i].code + "): mode=" + mode);
        } catch(e2) {
            log(tryOps[i].name + " (" + tryOps[i].code + "): 无效");
        }
    }
} catch(e) {
    log("AppOps: ✗ 失败 - " + e);
}

// 4. MIUI SecurityManager 检测
log("\n--- MIUI SecurityManager ---");
try {
    importClass(android.content.Context);
    var smClass = java.lang.Class.forName("miui.security.SecurityManager");
    log("miui.security.SecurityManager: 存在");
} catch(e) {
    log("miui.security.SecurityManager: 不存在");
}

try {
    var sm = context.getSystemService("security");
    if (sm) {
        log("SecurityManager服务: 获取成功");
        var methods = sm.getClass().getMethods();
        for (var i = 0; i < Math.min(methods.length, 20); i++) {
            log("  " + methods[i].getName());
        }
    } else {
        log("SecurityManager服务: null");
    }
} catch(e) {
    log("SecurityManager服务: 失败 - " + e);
}

// 5. requestPermissions 测试
log("\n--- requestPermissions 测试 ---");

// AutoJs6 runtime.requestPermissions
log("runtime.requestPermissions 可用: " + (typeof runtime.requestPermissions === "function"));

// 检查 android.content.pm.PackageManager 常量
try {
    log("PERMISSION_GRANTED = " + android.content.pm.PackageManager.PERMISSION_GRANTED);
    log("PERMISSION_DENIED = " + android.content.pm.PackageManager.PERMISSION_DENIED);
} catch(e) {
    log("PackageManager常量: 失败 - " + e);
}

// 尝试用 androidx.core.app.ActivityCompat.requestPermissions
log("\n--- ActivityCompat.requestPermissions 测试 ---");
var testPerms = [
    "android.permission.QUERY_ALL_PACKAGES",
    "android.permission.SYSTEM_ALERT_WINDOW",
    "android.permission.WRITE_SECURE_SETTINGS",
    "android.permission.MANAGE_APP_OPS_MODES",
    "android.permission.PACKAGE_USAGE_STATS"
];
for (var i = 0; i < testPerms.length; i++) {
    try {
        var perm = testPerms[i];
        var result = androidx.core.content.ContextCompat.checkSelfPermission(context, perm);
        var granted = (result === android.content.pm.PackageManager.PERMISSION_GRANTED);
        log(perm + ": " + (granted ? "已授权" : "未授权") + " (" + result + ")");
    } catch(e) {
        log(testPerms[i] + ": 检测失败 - " + e);
    }
}

// 测试 checkSelfPermission 对普通危险权限是否正常
log("\n--- 对照组（普通危险权限）---");
var normalPerms = [
    "android.permission.CAMERA",
    "android.permission.READ_CONTACTS",
    "android.permission.ACCESS_FINE_LOCATION"
];
for (var j = 0; j < normalPerms.length; j++) {
    try {
        var result2 = androidx.core.content.ContextCompat.checkSelfPermission(context, normalPerms[j]);
        log(normalPerms[j] + ": " + (result2 === 0 ? "已授权" : "未授权") + " (" + result2 + ")");
    } catch(e) {
        log(normalPerms[j] + ": 检测失败 - " + e);
    }
}

// 尝试用 context.checkSelfPermission（Android 原生 API）
log("\n--- context.checkSelfPermission ---");
for (var k = 0; k < testPerms.length; k++) {
    try {
        var result3 = context.checkSelfPermission(testPerms[k]);
        log(testPerms[k] + ": " + (result3 === 0 ? "已授权" : "未授权") + " (" + result3 + ")");
    } catch(e) {
        log(testPerms[k] + ": 检测失败 - " + e);
    }
}

// 尝试 requestPermissions 直接申请
log("\n--- 尝试 requestPermissions 直接申请 ---");
try {
    var permArr = java.lang.reflect.Array.newInstance(java.lang.String, 1);
    permArr[0] = "android.permission.QUERY_ALL_PACKAGES";
    androidx.core.app.ActivityCompat.requestPermissions(
        context,
        permArr,
        1001
    );
    log("requestPermissions QUERY_ALL_PACKAGES: 已调用（看是否弹出对话框）");
} catch(e) {
    log("requestPermissions QUERY_ALL_PACKAGES: 失败 - " + e);
}

log("\n=== 测试完成 ===");
