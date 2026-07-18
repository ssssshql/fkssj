// test/双指缩放.js
// 测试双指捏合缩小地图

requestScreenCaptureAsync(false);
sleep(1000);

var dm = context.getResources().getDisplayMetrics();
var cx = Math.round(dm.widthPixels / 2);
var cy = Math.round(dm.heightPixels / 2);

toast("双指缩放测试开始，3秒后执行...");
sleep(3000);

log("屏幕: " + dm.widthPixels + " x " + dm.heightPixels);
log("中心: (" + cx + ", " + cy + ")");

// 双指向内收拢（缩小地图）
log("双指向内收拢...");
gestures(
    [0, 800, [cx - 300, cy - 100], [cx - 50, cy]],
    [0, 800, [cx + 300, cy + 100], [cx + 50, cy]]
);
sleep(2000);

log("测试完成");
