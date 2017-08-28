//元素相对于页面的left
function getElementLeft(element) {
    var actualLeft = element.offsetLeft;
    var current = element.offsetParent;

    while (current !== null) {
        actualLeft += current.offsetLeft;
        current = current.offsetParent;
    }

    return actualLeft;
}

//元素相对于页面的top
function getElementTop(element) {
    var actualTop = element.offsetTop;
    var current = element.offsetParent;

    while (current !== null) {
        actualTop += current.offsetTop;
        current = current.offsetParent;
    }

    return actualTop;
}

//获取元素相对于视口的位置
function getBoundingClientRect(element) {

    var scrollTop = document.documentElement.scrollTop;
    var scrollLeft = document.documentElement.scrollLeft;

    if(element.getBoundingClientRect) {
        if(typeof arguments.callee.offsetW != "number") {
            var temp = document.createElement("div");
            temp.style.cssText = "position: absolute; left: 0; top: 0;";
            document.body.appendChild(temp);
            arguments.callee.offsetH = -temp.getBoundingClientRect().top;
            arguments.callee.offsetW = -temp.getBoundingClientRect().left;
            document.body.removeChild(temp);
            temp = null;

            var rect = element.getBoundingClientRect();
            var offsetW = arguments.callee.offsetW;
            var offsetH = arguments.callee.offsetH;

            return {
                left: rect.left + offsetW,
                right: rect.right + offsetW,
                top: rect.top + offsetH,
                bottom: rect.bottom + offsetH
            }
        } else {//兼容不支持getBoundingClientRect的浏览器
            var actualLeft = getElementLeft(element);
            var actualTop = getElementTop(element);

            return {
                left: actualLeft - scrollLeft,
                right: actualLeft + element.offsetWidth - scrollLeft,
                top: actualTop - scrollTop,
                bottom: actualTop + element.offsetHeight - scrollTop
            }
        }
    }
}