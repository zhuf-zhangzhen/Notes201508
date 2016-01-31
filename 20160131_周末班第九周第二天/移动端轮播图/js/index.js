(function () {
    var dataAry = ["img/banner1.jpg", "img/banner2.jpg", "img/banner3.jpg", "img/banner4.jpg", "img/banner5.jpg"];

    //定义或者获取页面中需要的元素和变量
    var count = dataAry.length, step = 1;
    var banner = document.querySelector(".banner"), inner = banner.querySelector(".inner"), imgList = inner.getElementsByTagName("img");
    var tip = banner.querySelector(".tip"), spanList = tip.getElementsByTagName("span");
    var winW = document.documentElement.clientWidth || document.body.clientWidth, winH = document.documentElement.clientHeight || document.body.clientHeight;

    //绑定图片和焦点的数据
    ~function () {
        inner.style.width = winW * (count + 2) + "px";
        inner.style.left = -winW + "px";

        var str = "", strTip = "";
        str += "<img src='' trueImg='" + dataAry[count - 1] + "'/>";
        for (var i = 0; i < count; i++) {
            str += "<img src='' trueImg='" + dataAry[i] + "'/>";
            strTip += "<span></span>";
        }
        str += "<img src='' trueImg='" + dataAry[0] + "'/>";
        inner.innerHTML = str;
        tip.innerHTML = strTip;

        selectTip();
    }();

    //选中焦点
    function selectTip() {
        var temp = step;
        step > count ? temp = 1 : null;
        step < 1 ? temp = count : null;
        [].forEach.call(spanList, function (curTip, index) {
            curTip.className = (index + 1) === temp ? "select" : null;
        });
    }

    //图片延迟加载
    window.setTimeout(lazyImg, 500);
    function lazyImg() {
        [].forEach.call(imgList, function (curImg, index) {
            curImg.style.width = winW + "px";

            var oImg = new Image;
            oImg.src = curImg.getAttribute("trueImg");
            oImg.onload = function () {
                curImg.src = this.src;
                curImg.className = "opacityMove";
            }
        });
    }

    //实现自动轮播
    var autoTimer = null, autoInterval = 3000;
    autoTimer = window.setInterval(autoMove, autoInterval);

    function autoMove() {
        step++;
        inner.style.webkitTransitionDuration = "0.5s";
        inner.style.left = -step * winW + "px";
        selectTip();

        if (step > count) {
            window.setTimeout(function () {
                inner.style.webkitTransitionDuration = "0s";
                inner.style.left = -winW + "px";
                step = 1;
            }, 500);
        }
    }

    //绑定滑动处理的效果
    ["start", "move", "end"].forEach(function (item) {
        var tempFn = eval(item);
        inner.addEventListener("touch" + item, tempFn, false);
    });

    function start(e) {
        //结束正在运行的自动轮播
        window.clearInterval(autoTimer);
        inner.style.webkitTransitionDuration = "0s";

        //记录开始的坐标位置
        var touchPoint = e.touches[0];
        this["strX"] = touchPoint.pageX;
        this["strY"] = touchPoint.pageY;

        //记录开始的left值
        this["strL"] = parseFloat(this.style.left);
    }

    function move(e) {
        //记录最新的坐标位置,判断是否发生移动,以及移动的方向
        var touchPoint = e.touches[0];
        this["endX"] = touchPoint.pageX;
        this["endY"] = touchPoint.pageY;
        this["swipeFlag"] = isSwipe(this["strX"], this["endX"], this["strY"], this["endY"]);

        //如果发生移动了,在计算移动的方向,并且计算最新的left值
        if (this["swipeFlag"]) {
            this["swipeDir"] = swipeDirection(this["strX"], this["endX"], this["strY"], this["endY"]);

            //如果是左右移动
            if (/^(Left|Right)$/.test(this["swipeDir"])) {
                this["change"] = this["endX"] - this["strX"];
                this.style.left = this["strL"] + this["change"] + "px";
            }
        }
    }

    function end(e) {
        //判断移动的距离是否超过1/4屏幕的宽度,超过的话进入下一页,没超过还是回到当前页
        if (this["swipeFlag"]) {
            if (Math.abs(this["change"]) >= (winW / 4)) {
                if (this["swipeDir"] === "Left") {
                    step++;
                }
                if (this["swipeDir"] === "Right") {
                    step--;
                }
            }
        }
        inner.style.webkitTransitionDuration = "0.5s";
        this.style.left = -step * winW + "px";

        //边界处理
        if (step > count) {
            window.setTimeout(function () {
                inner.style.webkitTransitionDuration = "0s";
                inner.style.left = -winW + "px";
                step = 1;
            }, 500);
        }

        if (step < 1) {
            window.setTimeout(function () {
                inner.style.webkitTransitionDuration = "0s";
                inner.style.left = -count * winW + "px";
                step = count;
            }, 500);
        }

        //运动完成需要.5s,完成后我们在进行后续的操作：开启自动轮播，选中对应的焦点，把设置的自定义属性值清空
        var _this = this;
        ["strX", "strY", "endX", "endY", "strL", "swipeFlag", "swipeDir", "change"].forEach(function (name) {
            _this[name] = null;
        });

        window.setTimeout(function () {
            selectTip();
            autoTimer = window.setInterval(autoMove, autoInterval);
        }, 500);
    }

    //检测是否是滑动事件
    function isSwipe(strX, endX, strY, endY) {
        return Math.abs(endX - strX) > 30 || Math.abs(endY - strY) > 30;
    }

    //检测当前滑动的方向
    function swipeDirection(strX, endX, strY, endY) {
        return Math.abs(endX - strX) > Math.abs(endY - strY) ? ((endX - strX) > 0 ? "Right" : "Left") : ((endY - strY) > 0 ? "Down" : "Up");
    }
})();