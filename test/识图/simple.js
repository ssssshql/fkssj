let gameHelper = require("/sdcard/脚本/水世界/modules/gameHelper.js");

requestScreenCapture(false);
sleep(1000);

var img = images.read("/sdcard/脚本/水世界/img/土地.png");

runTest(0.91);

function runTest(threshold) {
    threads.start(function() {
        sleep(800);

        let result = gameHelper.findAll(img,threshold);
        gameHelper.showOverlay(result, img);
    });
}
