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
                                           ["multi-part-form-screen",],
                                           settings.name,
                                           "");
        
        var newSplash = easyElementCreator("div",
                                           ["multi-part-form-splash",]);
        var cancelButton = easyElementCreator("div",
                                              ["cancel-button",],
                                              null,
                                              "cancel");
        cancelButton.onclick = that.cancel;
        newSplash.appendChild(cancelButton);

        var nextButton = easyElementCreator("div",
                                            ["title",],
                                            null,
                                            screenOpts.splash);
        nextButton.onclick = _multiPageForm.next;
        newSplash.appendChild(nextButton);

        if (state.currentStep == (settings.steps.length - 1)) {
            var submitButton = easyElementCreator("div",
                                                  ["next-button",],
                                                  null,
                                                  "submit");
            submitButton.onclick = _multiPageForm.submit;
            newSplash.appendChild(submitButton);
        } else {
            var nextButton = easyElementCreator("div",
                                                ["next-button",],
                                                null,
                                                "next");
            nextButton.onclick = _multiPageForm.next;
            newSplash.appendChild(nextButton);
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

    _multiPageForm.submit = function() {
        console.log("TODO submit()");
    }

    var that = _multiPageForm;

    return _multiPageForm;
}
