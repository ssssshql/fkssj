// test/权限直接申请测试.js — 尝试直接弹出系统权限对话框

log("=== 直接申请权限测试 ===\n");

// 检查 context 是否是 Activity
log("context 类型: " + context.getClass().getSimpleName());

// 逐个测试申请权限
var perms = [
    "android.permission.QUERY_ALL_PACKAGES",
    "android.permission.SYSTEM_ALERT_WINDOW",
    "android.permission.PACKAGE_USAGE_STATS",
    "android.permission.WRITE_SETTINGS"
];

log("\n--- checkSelfPermission ---");
for (var i = 0; i < perms.length; i++) {
    try {
        var result = context.checkSelfPermission(perms[i]);
        var granted = (result === android.content.pm.PackageManager.PERMISSION_GRANTED);
        log(perms[i] + ": " + (granted ? "已授权" : "未授权") + " (" + result + ")");
    } catch(e) {
        log(perms[i] + ": 异常 - " + e);
    }
}

log("\n--- requestPermissions 尝试 ---");
try {
    var arr = java.lang.reflect.Array.newInstance(java.lang.String, 1);
    arr[0] = "android.permission.QUERY_ALL_PACKAGES";
    context.requestPermissions(arr, 2001);
    log("QUERY_ALL_PACKAGES: 已调用");
} catch(e) {
    log("QUERY_ALL_PACKAGES: 失败 - " + e);
}

try {
    var arr2 = java.lang.reflect.Array.newInstance(java.lang.String, 1);
    arr2[0] = "android.permission.SYSTEM_ALERT_WINDOW";
    context.requestPermissions(arr2, 2002);
    log("SYSTEM_ALERT_WINDOW: 已调用");
} catch(e) {
    log("SYSTEM_ALERT_WINDOW: 失败 - " + e);
}

try {
    var arr3 = java.lang.reflect.Array.newInstance(java.lang.String, 1);
    arr3[0] = "android.permission.WRITE_SETTINGS";
    context.requestPermissions(arr3, 2003);
    log("WRITE_SETTINGS: 已调用");
} catch(e) {
    log("WRITE_SETTINGS: 失败 - " + e);
}

log("\n=== 测试完成 ===");
