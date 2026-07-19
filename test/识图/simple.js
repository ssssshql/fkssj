let gameHelper = require("/sdcard/脚本/fkssj/modules/gameHelper.js");

requestScreenCapture(false);
sleep(1000);

var img = images.read("/sdcard/脚本/fkssj/img/搁浅商船/前往按钮.png");


runTest(0.1);

function runTest(threshold) {
    threads.start(function() {
        sleep(800);

        let result = gameHelper.findAll(img,threshold);
        gameHelper.showOverlay(result, img);
    });
}
