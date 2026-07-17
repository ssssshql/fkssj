// test/盟战/test_reward.js — 盟战奖励领取流程测试
// 每一步都会 showOverlay 显示识别结果，方便验证

var gh = require("/sdcard/脚本/fkssj/modules/gameHelper.js");

requestScreenCapture(false);
sleep(1000);

var warReward      = images.read("/sdcard/脚本/fkssj/img/盟战/城战奖励.png");
var warRewardExclaim = images.read("/sdcard/脚本/fkssj/img/盟战/感叹号.png");
var warRewardItem  = images.read("/sdcard/脚本/fkssj/img/盟战/奖励.png");
var warRewardClose = images.read("/sdcard/脚本/fkssj/img/盟战/城战奖励关闭.png");

runTest();

function runTest() {
    threads.start(function() {
        sleep(3000);

        // --- Step 1: 找到"城战奖励"按钮 ---
        var rewardPos = gh.findFirst(warReward, 0.7);
        gh.showOverlay(rewardPos, warReward);
        if (!rewardPos) {
            log("Step1: 未找到城战奖励按钮，结束");
            return;
        }
        log("Step1: 城战奖励按钮位置: (" + rewardPos.x + ", " + rewardPos.y + ")");
        sleep(2000);

        var rw = warReward.getWidth();
        var rh = warReward.getHeight();

        // --- Step 2: 在按钮上方区域查找感叹号（左右各扩展 1/4 宽度） ---
        // var expand = Math.floor(rw / 4);
        // var regionX = Math.max(0, rewardPos.x - expand);
        // var regionW = rw + expand * 2;
        // var regionY = Math.max(0, rewardPos.y - 200);
        // var regionH = 200;
        // log("Step2: 搜索区域 [" + regionX + ", " + regionY + ", " + regionW + ", " + regionH + "]");
        // gh.showRegionOverlay([regionX, regionY, regionW, regionH], "感叹号搜索区域");

        // var exclaimPos = gh.findFirstInRegion(warRewardExclaim, regionX, regionY, regionW, regionH, 0.7);
        // gh.showOverlay(exclaimPos, warRewardExclaim);
        // if (!exclaimPos) {
        //     log("Step2: 未找到感叹号，无奖励可领，结束");
        //     return;
        // }
        // log("Step2: 感叹号位置: (" + exclaimPos.x + ", " + exclaimPos.y + ")");
        // sleep(2000);

        // // --- Step 3: 点击"城战奖励"按钮 ---
        // var cx = rewardPos.x + rw / 2 + random(-10, 10);
        // var cy = rewardPos.y + rh / 2 + random(-10, 10);
        // click(cx, cy);
        // log("Step3: 点击城战奖励 (" + cx + ", " + cy + ")");
        // sleep(2000);

        // // --- Step 4: 找所有奖励图片，点击最右边的 ---
        // var rewards = gh.findAll(warRewardItem, 0.7);
        // gh.showOverlay(rewards, warRewardItem);
        // if (rewards.length > 0) {
        //     var rightmost = rewards[0];
        //     for (var i = 1; i < rewards.length; i++) {
        //         if (rewards[i].x > rightmost.x) rightmost = rewards[i];
        //     }
        //     var iw = warRewardItem.getWidth();
        //     var ih = warRewardItem.getHeight();
        //     var rx = rightmost.x + iw / 2 + random(-10, 10);
        //     var ry = rightmost.y + ih / 2 + random(-10, 10);
        //     click(rx, ry);
        //     log("Step4: 点击最右边奖励 (" + rx + ", " + ry + ")，共找到 " + rewards.length + " 个");
        // } else {
        //     log("Step4: 未找到奖励图片");
        // }
        // sleep(1500);

        // --- Step 5: 点击关闭按钮 ---
        var closePos = gh.findFirst(warRewardClose, 0.7);
        gh.showOverlay(closePos, warRewardClose);
        if (closePos) {
            var cw = warRewardClose.getWidth();
            var ch = warRewardClose.getHeight();
            var clx = closePos.x + cw / 2 + random(-10, 10);
            var cly = closePos.y + ch / 2 + random(-10, 10);
            click(clx, cly);
            log("Step5: 点击关闭 (" + clx + ", " + cly + ")");
        } else {
            log("Step5: 未找到关闭按钮");
        }

        log("测试完成");
    });
}
