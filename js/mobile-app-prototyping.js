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


function simpleTypeAhead(opts) {
    var _simpleTypeAhead = {}
    var settings = opts;

    var sourceData = null;
    _simpleTypeAhead.requestListener = function(response) {
        if (response.target.status >= 200 && response.target.status < 400) {
            //success!
            sourceData = response.target.response;
        } else {
            console.log("Uh oh: status code " + response.target.status + " while loading " + settings.typeaheadSource);
        }
    };

    _simpleTypeAhead.updateData = function() {
        requestListener = function(response) {
            if (response.target.status >= 200 && response.target.status < 400) {
                //success!
                sourceData = response.target.response;
            } else {
                console.log("Uh oh: status code " + response.target.status + " while loading " + settings.typeaheadSource);
            }
        };
        var request = new XMLHttpRequest();
        request.addEventListener("load", requestListener);
        var data = that.currentEntries()[that.currentPositionEntryNumber()];
        request.open("GET", settings.typeaheadSource.replace("%QUERY%", data));
        request.responseType = 'json';
        request.send();
    };

    settings.inputElement.onclick = function(elem) {
    }

    settings.inputElement.onkeyup = function(elem) {
        that.updateData();
        that.hideSuggestions();
        if (elem.target.value.length > 0) {
            var data = that.currentEntries()[that.currentPositionEntryNumber()];
            var suggestions = (that.filterResults(data) || []);
            if (suggestions.length > 0) {
                that.displaySuggestions(suggestions);
            }
        }
    }

    _simpleTypeAhead.currentEntries = function() {
        var result = [];
        var splitdata = settings.inputElement.value.split(",");
        for (var x=0; x<splitdata.length; x++) {
            result.push(splitdata[x].replace(/^\s+|\s+$/g, ''));
        }
        return result;
    }

    _simpleTypeAhead.numberOfEntries = function() {
        return that.currentEntries().length; 
    }

    _simpleTypeAhead.currentPositionEntryNumber = function() {
        var result = 0;
        if (settings.multipleEntries) {
            for (var x=0; x<settings.inputElement.value.length && x<settings.inputElement.selectionStart; x++) {
                if (settings.inputElement.value[x] === ",") {
                    result += 1;
                } 
            }
        }
        return result;
    }

    _simpleTypeAhead.filterResults = function(data) {
        var result = null;
        if (sourceData !== null) {
            result = []
            for (var x=0; x<sourceData.results.length; x++) {
                if (sourceData.results[x].value.toLowerCase().includes(data.toLowerCase())) {
                    result.push(sourceData.results[x].value);
                }
            }
        }
        return result;
    }

    _simpleTypeAhead.populateInput = function(value, entryNum) {
        that.hideSuggestions();
        if (!settings.multipleEntries) {
            settings.inputElement.value = value;
        } else {
            var entries = that.currentEntries();
            entries[entryNum] = value;
            settings.inputElement.value = entries.join(", ");
            if (settings.inputElement.value.replace(/^\s+|\s+$/g, '').slice(-1) !== ",") {
                settings.inputElement.value += ", ";
            }
        }
        settings.inputElement.focus();
    }

    _simpleTypeAhead.suggestionDisplayId = function() {
        return "id_" + settings.inputElement.name + "_suggestions";
    }

    _simpleTypeAhead.displaySuggestions = function(suggestions) {
        var suggestionsDisplay = easyElementCreator("div",
                                                   ["typeahead-suggestions",],
                                                   that.suggestionDisplayId())
        for (var x=0; x<suggestions.length; x++) {
            var suggestion = easyElementCreator("div",
                                                ["suggestion",],
                                                undefined,
                                                suggestions[x]);
            suggestion.onclick = function(elem) {
                that.populateInput(elem.target.innerHTML, that.currentPositionEntryNumber());
            }
            suggestionsDisplay.appendChild(suggestion);
        }
        settings.inputElement.parentNode.insertBefore(suggestionsDisplay, settings.inputElement.nextSibling);
    }

    _simpleTypeAhead.hideSuggestions = function() {
        var suggestionsDisplay = document.getElementById(that.suggestionDisplayId());
        if (typeof suggestionsDisplay !== undefined && suggestionsDisplay !== null) {
            settings.inputElement.parentNode.removeChild(suggestionsDisplay);
        }
    }

    var that = _simpleTypeAhead;
    _simpleTypeAhead.updateData();
    return _simpleTypeAhead;
}

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
                if (screenOpts.inputs[x].inputType === "typeahead-multientry-text") {
                    var inputGroup = easyElementCreator("div",
                                                        ['input-group',]);
                    var label = easyElementCreator("label",
                                                   ['input-label',],
                                                   undefined,
                                                   screenOpts.inputs[x].label);
                    inputGroup.appendChild(label);
                    var inputWrapper = easyElementCreator("span",
                                                          ["simple-typeahead",])
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
                    inputWrapper.appendChild(input);
                    inputGroup.appendChild(inputWrapper);
                    content.appendChild(inputGroup);
                    settings.pj = simpleTypeAhead({
                        'inputElement': input,
                        'typeaheadSource': screenOpts.inputs[x].typeaheadSource,
                        'multipleEntries': true 
                    });

                } else if (screenOpts.inputs[x].inputType === "typeahead-text") {
                    var inputGroup = easyElementCreator("div",
                                                        ['input-group',]);
                    var label = easyElementCreator("label",
                                                   ['input-label',],
                                                   undefined,
                                                   screenOpts.inputs[x].label);
                    inputGroup.appendChild(label);
                    var inputWrapper = easyElementCreator("span",
                                                          ["simple-typeahead",])
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
                    inputWrapper.appendChild(input);
                    inputGroup.appendChild(inputWrapper);
                    content.appendChild(inputGroup);
                    settings.pj = simpleTypeAhead({
                        'inputElement': input,
                        'typeaheadSource': screenOpts.inputs[x].typeaheadSource,
                        'multipleEntries': false
                    });

                } else if (screenOpts.inputs[x].inputType === "text") {
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
