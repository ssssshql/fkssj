var gameHelper = require("/sdcard/脚本/fkssj/modules/gameHelper.js");

requestScreenCapture(false);
sleep(1000);

const shuidao = images.read("/sdcard/脚本/fkssj/img/水稻.png");
const liandao = images.read("/sdcard/脚本/fkssj/img/镰刀.png");
const tudi = images.read("/sdcard/脚本/fkssj/img/土地.png");

const shuidaoSeed = images.read("/sdcard/脚本/fkssj/img/种子图标/水稻.png");

runTest()
function runTest() {

    threads.start(function() {
        sleep(800);

        let result = gameHelper.findAll(shuidao);
        gameHelper.showOverlay(result, shuidao);
        

        // 点击最上面的水稻（y最小）
        if (result.length > 0) {
            var topMatch = gameHelper.getMaxYPoint(result);
            var clickX = topMatch.x + shuidao.getWidth() / 2;
            // 最底下才能点击到
            var clickY = topMatch.y + shuidao.getHeight();
            click(clickX, clickY);
            log("点击最上面的水稻: (" + clickX + ", " + clickY + ")");
            sleep(2000);
        }

        retsult = null

        // 识别镰刀
        var retsult = gameHelper.findFirst(liandao);

        // 显示叠加层
        gameHelper.showOverlay(retsult, liandao);

        retsult = null

        sleep(2000)

        // 重新找水稻位置
        result = gameHelper.findAll(shuidao);
        gameHelper.showOverlay(result, shuidao);

        // 从镰刀出发，从上往下收割水稻
        var liandaoPos = gameHelper.findFirst(liandao, 0.6);
        if (liandaoPos && result.length > 0) {
            // 每个水稻取底部偏下坐标 + 随机偏移，按 y 从上到下排序
            var points = result.map(function(p) {
                return {
                    x: p.x + shuidao.getWidth() / 2 + Math.round(Math.random() * 10 - 5),
                    y: p.y + shuidao.getHeight() * 1.5 + Math.round(Math.random() * 10 - 5)
                };
            }).sort(function(a, b) { return a.y - b.y; });
            // 镰刀中心 + 随机偏移
            var ldx = liandaoPos.x + liandao.getWidth() / 2 + Math.round(Math.random() * 10 - 5);
            var ldy = liandaoPos.y + liandao.getHeight() / 2 + Math.round(Math.random() * 10 - 5);
            // gesture: [duration, [startX, startY], [p1], [p2], ...]
            var gestureParams = [2000, [ldx, ldy]];
            for (var k = 0; k < points.length; k++) {
                gestureParams.push([points[k].x, points[k].y]);
            }
            gesture.apply(null, gestureParams);
            log("镰刀滑动收割完成，经过 " + points.length + " 个水稻");
        } else {
            log("未找到镰刀或水稻，跳过收割");
        }

        result = null

        // 查到土地位置
        result = gameHelper.findAll(tudi,0.91);
        gameHelper.showOverlay(result, tudi);

        // 点击最上面的土地（y最小）
        if (result.length > 0) {
            console.log(1)
            var topMatch = gameHelper.getMaxYPoint(result);
            
            console.log(2)
            var clickX = topMatch.x + tudi.getWidth() / 2;
            // 最底下才能点击到
            var clickY = topMatch.y + tudi.getHeight();
            click(clickX, clickY);
            log("点击最上面的土地: (" + clickX + ", " + clickY + ")");
            sleep(2000);
        }

        // 重新查找土地位置
        result = gameHelper.findAll(tudi,0.91);
        gameHelper.showOverlay(result, tudi);

        // 查找水稻种子位置
        var seedPos = gameHelper.findFirst(shuidaoSeed, 0.7);
        gameHelper.showOverlay(seedPos, shuidaoSeed);

        // 从种子位置出发，从上往下播种
        if (seedPos && result.length > 0) {
            var landPoints = result.map(function(p) {
                return {
                    x: p.x + tudi.getWidth() / 2 + Math.round(Math.random() * 10 - 5),
                    y: p.y + tudi.getHeight() * 1.5 + Math.round(Math.random() * 10 - 5)
                };
            }).sort(function(a, b) { return a.y - b.y; });
            var sdx = seedPos.x + shuidaoSeed.getWidth() / 2 + Math.round(Math.random() * 10 - 5);
            var sdy = seedPos.y + shuidaoSeed.getHeight() / 2 + Math.round(Math.random() * 10 - 5);
            var gestureParams = [2000, [sdx, sdy]];
            for (var k = 0; k < landPoints.length; k++) {
                gestureParams.push([landPoints[k].x, landPoints[k].y]);
            }
            gesture.apply(null, gestureParams);
            log("播种完成，经过 " + landPoints.length + " 块土地");
        } else {
            log("未找到种子或土地，跳过播种");
        }
    });
}
