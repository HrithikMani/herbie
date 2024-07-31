var cmdtree = []
const stopScript = false;
function findElementThroughHeading(htext, childtext, depth) {
    // Construct the depth part of the XPath
    let parentPath = '';
    for (let i = 0; i < depth; i++) {
        parentPath += '/..';
    }
   
    // Construct the full XPath expression
    const xpath = `//*[self::h1 or self::h2 or self::h3 or self::h4 or self::h5 or self::h6 or self::label or self::span or self::div][contains(text(),"${htext}")]${parentPath}/descendant::*[(contains(text(),${childtext}) or contains(@value,${childtext}) or contains(@title,${childtext}) or contains(@alt,${childtext}) or contains(@placeholder,${childtext}))]`;
   
    // Evaluate the XPath expression and return the matching elements
    const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    const elements = [];
    for (let i = 0; i < result.snapshotLength; i++) {
        elements.push(result.snapshotItem(i));
    }
    return elements;
}

function FindDesc(desc) {
    try {
        var xpathResult = document.evaluate(desc, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        if (xpathResult.singleNodeValue) {
            el = $(xpathResult.singleNodeValue);
            logAttempt('XPath', el);
            if (el.length) return el;
        }
    } catch (e) {}
     
    var el, hadterm = 0;
    var originalDesc = desc;

    // Normalize description to be case-insensitive
    desc = desc.toLowerCase();

    // Append colon if not present
    if (!desc.match(':$')) {
        desc += ':';
    } else {
        hadterm = 1;
    }

    // Function to log attempts and results
    function logAttempt(method, result) {
        if (result.length) {
            console.log(`Found element using ${method} for description: "${originalDesc}"`);
        } else {
            console.log(`No element found using ${method} for description: "${originalDesc}"`);
        }
    }

    // 1. Try to find label with text containing the description
    try {
        el = $('label').filter(function() {
            return $(this).text().trim().toLowerCase().includes(desc);
        });
        if (el.length) {
            el = el.first();
            el = $('#' + el.attr('for'));
            logAttempt('label text', el);
            if (el.length) return el;
        }
    } catch (ex) {}

    // Remove trailing colon and try again
    desc = desc.slice(0, -1);

    try {
        el = $('label').filter(function() {
            return $(this).text().trim().toLowerCase().includes(desc);
        });
        if (el.length) {
            el = el.first();
            el = $('#' + el.attr('for'));
            logAttempt('label text without colon', el);
            if (el.length) return el;
        }
    } catch (ex) {}

    // Add colon back if it was originally present
    if (hadterm) {
        desc += ':';
    }

    // 2. Look for buttons containing the description
    try {
        el = $('button').filter(function() {
            return $(this).text().trim().toLowerCase().includes(desc);
        });
        logAttempt('button text', el);
        if (el.length) return el.first();
    } catch (ex) {}

    // 3. Look for links containing the description
    try {
        el = $('a').filter(function() {
            return $(this).text().trim().toLowerCase().includes(desc);
        });
        logAttempt('link text', el);
        if (el.length) return el.first();
    } catch (ex) {}

    // 4. Try to use the description as a jQuery selector
    try {
        el = $(desc);
        logAttempt('jQuery selector', el);
        if (el.length === 1) return el;
    } catch (e) {}

 

    // Log final failure
    console.log(`Failed to find element for description: "${originalDesc}"`);

    // Return empty array if no match is found
    return [];
}


function ExecuteScript() {
    var cmdtree = arguments[0], options = { line: 0, delay: 100, cmdtree: cmdtree }, callback, tag = [];
    if (arguments.length === 2) { // only two arguments supplied
        if (Object.prototype.toString.call(arguments[1]) === '[object Function]') {
            callback = arguments[1]; // if is a function, set as 'callback'
        } else {
            options = arguments[1]; // if not a function, set as 'options'
        }
    } else if (arguments.length === 3) { // three arguments supplied
        if (arguments[1]) {
            options = arguments[1];
        }
        callback = arguments[2];
    }

    var i = options.line;
    if (i >= cmdtree.length) {
        if (callback) {
            callback(true, options, 'Finished.');
        }
        return;
    }
    if (stopScript) {
        if (callback) {
            callback(true, null, 'Stopped.');
        }
        return;
    }

    var cmd = cmdtree[i];
    if (!cmd || !cmd.code) {
        console.error(`Invalid command at line ${i}:`, cmd);
        if (callback) {
            callback(true, options, 'Error: Invalid command');
        }
        return;
    }

    var inclause = $.inArray('in', cmd.code);
    if (inclause !== -1) {
        var tagname = cmd.code[inclause + 1];
       
        if(cmd.header){
            console.log("Subcommand : "+cmd.code[2]);
            tag=findElementThroughHeading(cmd.header,cmd.code[2],2);
            console.log(tag);
        }else{
            if (tagname.charAt(0) === '"' || tagname.charAt(0) === '\'') {
                tagname = tagname.slice(1, -1);
            }
            tag = FindDesc(tagname);
        }

        if (!tag.length) {
            if (cmd.timeout > 0) {
                cmd.timeout -= options.delay;
                console.log(`Waiting for element: ${tagname}`);
                return setTimeout(function () { ExecuteScript(cmdtree, options, callback); }, options.delay);
            } else {
                log(`Cannot find tag named: "${tagname}". Proceeding to next command.`);
                options.line++;
                return setTimeout(function () {
                    ExecuteScript(cmdtree, options, callback);
                }, options.delay);
            }
        }
    }

    if (callback) {
        callback(false, options);
    }

    console.log(`Executing command: ${cmd.code.join(' ')}`);
    switch (cmd.code[0]) {
        case 'under':
            console.log("Running subcommands")
            ExecuteScript(cmd.subcommands, { line: 0, delay: 100, cmdtree: cmd.subcommands}, callback);
            break;
        case 'press':
            var seq = cmd.code[1];
            simulijs.simulateFocus(tag[0],function(){
                simulijs.simulateKeyPress(tag[0],seq);
            });
            return setTimeout(function () {
                options.line++;
                ExecuteScript(cmdtree, options, callback);
            }, options.delay);

        case 'type':
            var seq = cmd.code[1];
            if (seq.charAt(0) === '"' || seq.charAt(0) === '\'') {
                seq = seq.slice(1, -1);
            }

            if (tag.length) {
                simulijs.simulateFocus(tag[0],function(){
                    simulijs.simulateKeyPress(tag[0],seq);
                });
                return setTimeout(function () {
                    options.line++;
                    ExecuteScript(cmdtree, options, callback);
                }, options.delay);
            }
           
        case 'click':
            if (tag.length) {
                console.log(tag);
                simulijs.simulateClick(tag[0]);
            }
            return setTimeout(function () {
                options.line++;
                ExecuteScript(cmdtree, options, callback);
            }, options.delay);

        case 'wait':
            var waitTime = parseInt(cmd.code[1], 10);
            if (isNaN(waitTime)) {
                console.error(`Invalid wait time at line ${i}:`, cmd.code[1]);
                if (callback) {
                    callback(true, options, 'Error: Invalid wait time');
                }
                return;
            }
            console.log(`Waiting for ${waitTime} milliseconds`);
            return setTimeout(function () {
                options.line++;
                ExecuteScript(cmdtree, options, callback);
            }, waitTime);

        case 'mouseover':
            if (tag.length) {
                console.log(cmd.src)
                console.log(tag);
                simulijs.simulateMouseEnter(tag[0],function(){
                    console.log(tag[0].parentElement.parentElement.parentElement.parentElement.innerHTML)
                });
               
                
            }
            return setTimeout(function () {
                options.line++;
                ExecuteScript(cmdtree, options, callback);
            }, options.delay);

        case 'verify':
            var text = cmd.code[1];
            if (text.charAt(0) === '"' || text.charAt(0) === '\'') {
                text = text.slice(1, -1);
            }
            if (tag.length) {
                const element = tag[0];
                if (element.textContent.includes(text)) {
                    console.log(`Text "${text}" found in element ${tagname}.`);
                    chrome.runtime.sendMessage({ action: 'log', data: `Text "${text}" found in element ${tagname}.` });
                } else {
                    console.log(`Text "${text}" not found in element ${tagname}.`);
                    chrome.runtime.sendMessage({ action: 'log', data: `Text "${text}" not found in element ${tagname}.` });
                }
            }
            return setTimeout(function () {
                options.line++;
                ExecuteScript(cmdtree, options, callback);
            }, options.delay);

        case 'select':
            var value = cmd.code[1];
            if (value.charAt(0) === '"' || value.charAt(0) === '\'') {
                value = value.slice(1, -1);
            }
            if (tag.length) {
                var selectElement = tag[0];
                var optionFound = false;
                for (var j = 0; j < selectElement.options.length; j++) {
                    if (selectElement.options[j].value === value) {
                        selectElement.selectedIndex = j;
                        optionFound = true;
                        simulijs.simulateChange(selectElement);
                        break;
                    }
                }
                if (!optionFound) {
                    console.error(`Option "${value}" not found in select element at line ${i}.`);
                    if (callback) {
                        callback(true, options, `Error: Option "${value}" not found`);
                    }
                    return;
                }
            }
            return setTimeout(function () {
                options.line++;
                ExecuteScript(cmdtree, options, callback);
            }, options.delay);

        default:
            return setTimeout(function () {
                options.line++;
                ExecuteScript(cmdtree, options, callback);
            }, options.delay);
    }
}



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'RUN') {
        const scriptContent = message.data;
        cmdtree = scriptContent;

        var options = { line: message.line, delay: 100, cmdtree: cmdtree };

        // Ensure cmdtree is properly structured
        if (!Array.isArray(cmdtree) || cmdtree.length === 0) {
            sendResponse({ status: 'error', data: 'Invalid script content received' });
            console.error('Invalid script content received:', scriptContent);
            return;
        }

        ExecuteScript(cmdtree, options, function (done, option, comment) {
            if (option) {
                var currentCmd = option.cmdtree[option.line];
                if (currentCmd && currentCmd.src) {
                    var txt = 'Line: ' + (option.line + 1) + ', Cmd:' + currentCmd.src + '\n';
                    log(txt);
                }
            }

            if (comment) {
                log(comment);
            }
        });

        sendResponse({ status: 'success', data: 'Script received' });
        console.log('Script content received from background:', scriptContent);
    }

    return true; // Keep the messaging channel open for asynchronous responses
});



function log(log){
  chrome.runtime.sendMessage({ action: 'log', data: log }, (response) => {
    console.log('Response from background:', response.data);
 });

}


function highlightElement(event) {
    event.target.style.outline = '2px solid red';
}

function removeHighlight(event) {
    event.target.style.outline = '';
}

function captureXPath(event) {
    event.preventDefault();
    event.stopPropagation();
    
    document.removeEventListener('mouseover', highlightElement);
    document.removeEventListener('mouseout', removeHighlight);
    document.removeEventListener('click', captureXPath, true);
    
    const element = event.target;
    const xpath = getElementXPath(element);
    console.log(xpath);
    chrome.runtime.sendMessage({ action: 'set_xpath', xpath: xpath},(response) => {
        console.log(response);
    });
}

function getElementXPath(element) {
    let paths = [];
    for (; element && element.nodeType == Node.ELEMENT_NODE; element = element.parentNode) {
        let index = 0;
        for (let sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
            if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE) continue;
            if (sibling.nodeName == element.nodeName) ++index;
        }
        let tagName = element.nodeName.toLowerCase();
        let pathIndex = (index ? `[${index + 1}]` : '');
        paths.splice(0, 0, `${tagName}${pathIndex}`);
    }
    return paths.length ? `/${paths.join('/')}` : null;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'start_inspecting') {
        document.addEventListener('mouseover', highlightElement);
        document.addEventListener('mouseout', removeHighlight);
        document.addEventListener('click', captureXPath, true);
    }
});

