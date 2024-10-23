
## Herbie

Herbie is a Chrome extension that makes web automation simple and easy. It allows you to perform actions like clicking buttons, filling out forms, and checking for text on a webpage – all with clear, easy-to-understand commands.

### Key Features:
1. **Automate Web Actions**: Click, type, and verify elements on any webpage effortlessly.
2. **Use Keywords for Reusability**: Define custom keywords to reuse common actions, making your scripts cleaner and easier to maintain.
3. **Record and Save Scripts**: Create and save automation scripts directly from your browser.
4. **Detailed Logs**: Track what your scripts do and quickly identify any issues.

Herbie makes it easy for anyone to automate web tasks without needing complex tools or programming knowledge.

Install Herbie from the Chrome Web Store: [Herbie Dev Extension](https://chromewebstore.google.com/detail/herbie-dev/bikchlaboloecmadcmngdofkfpajoahn)

Documentation :  http://mieweb.github.io/herbie/

# How to Install the Chrome Extension
[Download Link](https://github.com/HrithikMani/herbie/releases/latest)
1. Clone the project to your local machine or download the chrome extension from above link.
2. Open Chrome and go to `Preferences... -> Extensions`.
3. Ensure "Developer mode" is checked (upper left).
4. Click "Load unpacked extension...".
5. Browse to the `chrome_extension` folder in the project.

Voila! Now a Herbie robot button should exist on the toolbar. It will inject Herbie into the background of the current tab of any webpage.

## Simulating User Interactions

Instead of using the jQuery Simulate Extended plug-in (a.k.a. jquery-simulate-ext) for simulating complex user interactions based on the [jQuery.simulate()](https://github.com/jquery/jquery-simulate) plug-in, we have used `mie-simulijs`, which was developed in MIE. It's a package that simulates events on the page. Here is the npm package: [mie-simulijs](https://www.npmjs.com/package/mie-simulijs).

We made this change because the jQuery Simulate package was not being maintained, and some events like mouseover and mouseenter were not working as expected. To overcome this, we had to build our own package. Feel free to check out the package.


## Initial Herbie
----

Feel free to check out Herbie, which was written in jQuery in 2015. This was one of the first versions.

An online demo is available here: [Herbie Demo](http://mieweb.github.io/herbie/demo/index.html#run_herbie)

![Initial version of Herbie](http://mieweb.github.io/herbie/herbie_movie.gif)

Current herbie 

![Current version of Herbie](http://mieweb.github.io/herbie/herbie_current.gif)

About
-----
Through a fault in manufacturing, a robot, RB-34 (a.k.a. Herbie), is created that possesses telepathic abilities. https://en.wikipedia.org/wiki/Liar!_(short_story)

References
----------

Inspiration has been drawn from:
* [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin) and [Cucumber](https://cukes.info/) but Vision has a slightly different goals.
* [Sikuli Script](http://www.sikuli.org/) tho specific to the web, and mean to be browser independant.
* [DalekJS](http://dalekjs.com/pages/documentation.html)
* [Nightwatch.js](http://nightwatchjs.org/)
* [Selenium Web Driver](https://code.google.com/p/selenium/wiki/JsonWireProtocol) of course.
* For recording [xss-keylogger](https://github.com/hadynz/xss-keylogger)
* [Chrome Extension Examples](https://developer.chrome.com/extensions/samples#search:webnavigation.oncommitted)
* [Mozilla FireFox Extension](https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Modifying_the_Page_Hosted_by_a_Tab)
* [Safari Extension Developer](https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/Introduction/Introduction.html)
* [Developing Internet Explorer Extensions](http://stackoverflow.com/questions/5643819/developing-internet-explorer-extensions)
