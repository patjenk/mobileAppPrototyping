function isVisible(elem) {
    if (!(elem instanceof Element)) throw Error('DomUtil: elem is not an element.');
    const style = getComputedStyle(elem);
    if (style.display === 'none') return false;
    if (style.visibility !== 'visible') return false;
    if (style.opacity < 0.1) return false;
    if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height +
        elem.getBoundingClientRect().width === 0) {
        return false;
    }
    const elemCenter   = {
        x: elem.getBoundingClientRect().left + elem.offsetWidth / 2,
        y: elem.getBoundingClientRect().top + elem.offsetHeight / 2
    };
    if (elemCenter.x < 0) return false;
    if (elemCenter.x > (document.documentElement.clientWidth || window.innerWidth)) return false;
    if (elemCenter.y < 0) return false;
    if (elemCenter.y > (document.documentElement.clientHeight || window.innerHeight)) return false;
    let pointContainer = document.elementFromPoint(elemCenter.x, elemCenter.y);
    do {
        if (pointContainer === elem) return true;
    } while (pointContainer = pointContainer.parentNode);

    const elemBottomCenter   = {
        x: elem.getBoundingClientRect().left + elem.offsetWidth / 2,
        y: elem.getBoundingClientRect().top + elem.offsetHeight - 1
    };
    let bottomPointContainer = document.elementFromPoint(elemBottomCenter.x, elemBottomCenter.y);
    do {
        if (bottomPointContainer === elem) return true;
    } while (bottomPointContainer = bottomPointContainer.parentNode);

    const elemTopCenter   = {
        x: elem.getBoundingClientRect().left + elem.offsetWidth / 2,
        y: elem.getBoundingClientRect().top + 1
    };
    let topPointContainer = document.elementFromPoint(elemTopCenter.x, elemTopCenter.y);
    do {
        if (topPointContainer === elem) return true;
    } while (topPointContainer = topPointContainer.parentNode);

    return false;
}

function wheelSelect(opts) {
    var _wheelSelect = {};
    var settings = opts;
    settings.mousedown = false;
    settings.mouseY = null;
    settings.selectedElement = null;

    _wheelSelect.value = function () {
        var result = null;
        if (settings.selectedElement !== null) {
            result = settings.selectedElement.innerHTML;
        }
        return result;
    }

    function findWheelCenter() {
        const scrollWheelCenter   = {
            x: settings.wheelContainer.getBoundingClientRect().left + settings.wheelContainer.offsetWidth / 2,
            y: settings.wheelContainer.getBoundingClientRect().top + settings.wheelContainer.offsetHeight / 2
        };
        let foremostElement = document.elementFromPoint(scrollWheelCenter.x, scrollWheelCenter.y);
        while (foremostElement !== null && typeof foremostElement.classList !== "undefined" && !foremostElement.classList.contains("wheel-element")) {
            foremostElement = foremostElement.parentNode;
        }
        return foremostElement;
    }

    function centerWheel() {
        var selectedElement = findWheelCenter();
        var wheelCenterY = settings.wheelContainer.getBoundingClientRect().top + settings.wheelContainer.offsetHeight / 2
        var selectedElementY = selectedElement.getBoundingClientRect().top + selectedElement.offsetHeight / 2;
        var wheelOffset = wheelCenterY - selectedElementY;
        moveWheel(wheelOffset);
    }

    function highlightWheelSelection() {
        var centerElement = findWheelCenter();
        if (settings.selectedElement === null) {
            settings.selectedElement = centerElement;
            centerElement.classList.add("selected");
        } else if (settings.selectedElement != centerElement) {
            if (settings.selectedElement !== null && typeof settings.selectedElement.classList !== "undefined") {
                settings.selectedElement.classList.remove("selected");
            }
            if (centerElement !== null && typeof centerElement.classList !== "undefined") {
                centerElement.classList.add("selected");
            }
            settings.selectedElement = centerElement;
        }
    }

    function moveWheel(yDiff) {

        var wheelElements = settings.wheelContainer.getElementsByClassName("wheel-element");
        for (var x=0; x<wheelElements.length; x++) {
            var verticalTranslate = oldVerticalTranslateValue(wheelElements[x].style.transform) + yDiff;
            wheelElements[x].style.transform = "translate(0, " + verticalTranslate + "px)";
        }
        highlightWheelSelection();
    }

    settings.wheelContainer = easyElementCreator("div",
                                                 ["wheel-container",]);
    settings.firstWheelElement = easyElementCreator("div",
                                                    ["wheel-element",],
                                                    "firstWheelElement",
                                                    "");
    settings.wheelContainer.appendChild(settings.firstWheelElement);
    for (var x=0; x<settings.options.length; x++) {
        var wheelElement = easyElementCreator("div",
                                              ["wheel-element",],
                                              undefined,
                                              settings.options[x]);
        settings.wheelContainer.appendChild(wheelElement);
    }
    settings.lastWheelElement = easyElementCreator("div",
                                                   ["wheel-element",],
                                                   "lastWheelElement",
                                                   "");
    settings.wheelContainer.appendChild(settings.lastWheelElement);

    function oldVerticalTranslateValue(transformStyleValue) {
        if (transformStyleValue.toLowerCase().indexOf("translate") === -1) {
            result = "1";
        } else {
            result = transformStyleValue.split(",")[1].split("px")[0].replace(/^\s+|\s+$/g, '');
        }
        return parseInt(result);
    }

    settings.wheelContainer.onmousedown = function(event) {
        var wheelElements = settings.wheelContainer.getElementsByClassName("wheel-element");
        for (var x=0; x<wheelElements.length; x++) {
            wheelElements[x].classList.add("scrolling");
        }
        settings.mousedown = true;
        settings.mouseY = event.clientY;
    }

    settings.wheelContainer.onmouseup = function(event) {
        var wheelElements = settings.wheelContainer.getElementsByClassName("wheel-element");
        for (var x=0; x<wheelElements.length; x++) {
            wheelElements[x].classList.remove("scrolling");
        }
        settings.mousedown = false;
        settings.mouseY = null;
        centerWheel();
    }

    settings.wheelContainer.onmousemove = function(event) {
        // dragging down results in positive diff values
        // dragging up results in negative diff value
        var yDiff = event.clientY - settings.mouseY;
        if (settings.mousedown) {
            moveWheel(yDiff);
            if (isVisible(settings.firstWheelElement)) {
                var wheelElements = settings.wheelContainer.getElementsByClassName("wheel-element");
                var lastRealWheelElement = wheelElements[wheelElements.length-2];
                wheelElements[1].parentNode.insertBefore(lastRealWheelElement, wheelElements[1]);
                moveWheel(-25);
            }
            if (isVisible(settings.lastWheelElement)) {
                var wheelElements = settings.wheelContainer.getElementsByClassName("wheel-element");
                var firstRealWheelElement = wheelElements[1];
                settings.lastWheelElement.parentNode.insertBefore(firstRealWheelElement, settings.lastWheelElement);
                moveWheel(25);
            }
        }
        settings.mouseY = event.clientY;
    }

    settings.wheelContainer.onclick = function(elem) {
    }

    settings.element.appendChild(settings.wheelContainer);
    moveWheel(-25); // hide first element
    centerWheel();
    highlightWheelSelection();


    var that = _wheelSelect;
    return that;
}

