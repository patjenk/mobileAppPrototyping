function multiPageForm(opts) {

    var _multiPageForm = {};


    var settings = opts;

    var state = {
        otherViews: {},
        currentStep: 0,
        currentView: null,
        data: {},
        active: false,
    }

    var easyElementCreator = function(elementTypeName, classNames, idName, content) {
        var result = document.createElement(elementTypeName);
        if (typeof classNames !== 'undefined') {
            for (var x=0; x<classNames.length; x++) {
                result.classList.add(classNames[x]);
            }
        }
        if (typeof idName !== 'undefined') {
            result.id = idName;
        }
        if (typeof content !== 'undefined') {
            result.innerHTML = content;
        } 
        return result;
    }

    _multiPageForm.createScreen = function(screenOpts) {
        var newScreen = easyElementCreator("div",
                                           ["multi-part-form",],
                                           settings.name,
                                           "");
       
        var newSplash = easyElementCreator("div",
                                           ["splash",]);
         
        if (state.currentStep == 0) {
            var cancelButton = easyElementCreator("div",
                                                  ["splash-element", "cancel-button",],
                                                  undefined,
                                                  "cancel");
            cancelButton.onclick = that.cancel;
            newSplash.appendChild(cancelButton);
            newSplash.appendChild(document.createTextNode("\r\n"));
        } else {
            var backButton = easyElementCreator("div",
                                                  ["splash-element", "back-button",],
                                                  undefined,
                                                  "back");
            backButton.onclick = that.back;
            newSplash.appendChild(backButton);
            newSplash.appendChild(document.createTextNode("\r\n"));
        }

        var nextButton = easyElementCreator("div",
                                            ["splash-element", "title",],
                                            undefined,
                                            screenOpts.splash);
        nextButton.onclick = _multiPageForm.next;
        newSplash.appendChild(nextButton);
        newSplash.appendChild(document.createTextNode("\r\n"));

        if (state.currentStep == (settings.steps.length - 1)) {
            var submitButton = easyElementCreator("div",
                                                  ["splash-element", "next-button",],
                                                  undefined,
                                                  "submit");
            submitButton.onclick = _multiPageForm.submit;
            newSplash.appendChild(submitButton);
            newSplash.appendChild(document.createTextNode("\r\n"));
        } else {
            var nextButton = easyElementCreator("div",
                                                ["splash-element", "next-button",],
                                                undefined,
                                                "next");
            nextButton.onclick = _multiPageForm.next;
            newSplash.appendChild(nextButton);
            newSplash.appendChild(document.createTextNode("\r\n"));
        }


        newScreen.appendChild(newSplash);

        return newScreen;
    }


    _multiPageForm.hideOtherViews = function() {
        var otherViews = document.getElementsByClassName('mobile-app-prototyping');
        for (var x=0; x<otherViews.length; x++) {
            // save old state
            state.otherViews[x] = otherViews[x].style.display;
            // hide element   
            otherViews[x].style.display = "none";
        }
    }

    _multiPageForm.restoreOtherViews = function() {
        var otherViews = document.getElementsByClassName('mobile-app-prototyping');
        for (var x=0; x<otherViews.length; x++) {
            otherViews[x].style.display = state.otherViews[x]
        }
    }

    _multiPageForm.show = function() {
        state.active = true;
        that.hideOtherViews();
        var newScreen = that.createScreen(settings.steps[state.currentStep]);
        state.currentView = newScreen;
        document.body.appendChild(newScreen);
    }

    _multiPageForm.cancel = function() {
        state.active = false;
        state.currentStep = 0;
        state.data = {}
        that.restoreOtherViews();
        state.otherViews = {}
        document.body.removeChild(state.currentView);
        state.currentView = null;
    }

    _multiPageForm.next = function() {
        state.currentStep += 1;
        var newScreen = that.createScreen(settings.steps[state.currentStep]);
        document.body.removeChild(state.currentView);
        document.body.appendChild(newScreen);
        state.currentView = newScreen;
    }

    _multiPageForm.back = function() {
        state.currentStep -=1;
        var newScreen = that.createScreen(settings.steps[state.currentStep]);
        document.body.removeChild(state.currentView);
        document.body.appendChild(newScreen);
        state.currentView = newScreen;
    }

    _multiPageForm.submit = function() {
        console.log("TODO submit()");
    }

    var that = _multiPageForm;

    return _multiPageForm;
}
