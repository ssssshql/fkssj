// test/权限检测.js — 权限和设备信息检测测试

var gh = require("/sdcard/脚本/fkssj/modules/gameHelper.js");

toast("开始检测...");
sleep(1000);

// 分辨率
var res = gh.getRealResolution();
log("分辨率: " + res[0] + " × " + res[1]);
log("device.width: " + device.width);
log("device.height: " + device.height);

// 应用列表权限
log("应用列表权限: " + (gh.hasPackageListPerm() ? "已开启" : "未开启"));

// 无障碍权限
log("无障碍权限: " + (gh.hasAccessibilityPerm() ? "已开启" : "未开启"));

// 后台弹出权限
log("后台弹出权限: " + (gh.hasBackgroundPopupPerm() ? "已开启" : "未开启"));

// 悬浮窗权限
log("悬浮窗权限: " + (gh.hasOverlayPerm() ? "已开启" : "未开启"));

toast("检测完毕，查看日志");
