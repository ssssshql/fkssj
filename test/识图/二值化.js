let gameHelper = require("/sdcard/脚本/fkssj/modules/gameHelper.js");

requestScreenCapture(false);
sleep(1000);

var img = images.read("/sdcard/脚本/fkssj/img/土地.png");


runTest(0.8);

function runTest(threshold) {
    threads.start(function() {
        sleep(800);
        let result = gameHelper.findAllToFilter(img,threshold,"土地",120);
        gameHelper.showOverlay(result, img);
    });
}
