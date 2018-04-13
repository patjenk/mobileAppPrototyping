function multiPageForm(opts) {

    var _multiPageForm = {};


    var settings = opts;

    var state = {
        otherViews: {},
        currentStep: 0,
        currentView: null,
        data: [],
        active: false,
    }

    // initialize form data
    for (var x=0; x<settings.steps.length; x++) {
        var newData = {}
        if (typeof settings.steps[x].inputs !== "undefined") {
            for (var y=0; y<settings.steps[x].inputs.length; y++) {
                if (typeof settings.steps[x].inputs[y].value !== "undefined") {
                    newData[settings.steps[x].inputs[y].inputName] = settings.steps[x].inputs[y].value;
                }
            }
        }
        state.data.push(newData);
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

        var content = easyElementCreator("div",
                                         ["content",]);

        if (typeof screenOpts.inputs !== "undefined") {
            for (var x=0; x<screenOpts.inputs.length; x++) {
                if (screenOpts.inputs[x].inputType === "text") {
                    var inputGroup = easyElementCreator("div",
                                                        ['input-group',]);
                    var label = easyElementCreator("label",
                                                   ['input-label',],
                                                   undefined,
                                                   screenOpts.inputs[x].label);
                    inputGroup.appendChild(label);
                    var input = easyElementCreator("input",
                                                   ['multi-part-form-input',]);
                    input.setAttribute('type', 'text');
                    input.name = screenOpts.inputs[x].inputName;
                    if (typeof screenOpts.inputs[x].placeholder !== "undefined") {
                        input.placeholder = screenOpts.inputs[x].placeholder;
                    }
                    if (typeof screenOpts.inputs[x].id !== "undefined") {
                        input.id = screenOpts.inputs[x].id;
                    }
                    if (typeof state.data[state.currentStep] != "undefined" && typeof state.data[state.currentStep][screenOpts.inputs[x].inputName] !== "undefined") {
                        input.value = state.data[state.currentStep][screenOpts.inputs[x].inputName];
                    }
                    inputGroup.appendChild(input);
                    content.appendChild(inputGroup);
                }
            }

        }
        newScreen.appendChild(content);

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
        // save form data!
        var currentStep = settings.steps[state.currentStep];
        if (typeof currentStep.inputs !== "undefined") {
            for (var y=0; y<currentStep.inputs.length; y++) {
                var allInputs = document.getElementsByClassName('multi-part-form-input');
                for (var z=0; z<allInputs.length; z++) {
                    if (allInputs[z].name === currentStep.inputs[y].inputName) {
                        state.data[state.currentStep][currentStep.inputs[y].inputName] = allInputs[z].value;

                    }
                }
            }
        }

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
