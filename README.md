# Spelling Bee Helper

Update the Spelling Bee game on the New York Times website to add Today's Hints to the game screen.

Stop using multiple windows to keep track of the words you still have left to find.

The word grid and two letter list are kept up to date based on what you've already found. No more manually counting how many 5 letter words you've found!

You can start using the Spelling Bee helper by installing it for [Firefox](https://addons.mozilla.org/en-US/firefox/addon/spelling-bee-helper/) or [Chrome](https://chrome.google.com/webstore/detail/spelling-bee-helper/ilbdolhmhkjhecehbdcneffapakklbgh).

## Building

If you want to build your own version of the Spelling Bee Helper follow these instructions.

You’ll need to have Node installed to build. You can download the installer from the [Node website](https://nodejs.org/en).

In the project directory, use the following command to build the project:

`npm run build`

This builds the app to the `build` folder. Everything you need for the plugin is included.

## Installing

To install your custom build of the Spelling Bee helper, follow the instructions for your browser.

### Firefox

1. Open the `Tools` menu and select `Add-ons and Themes`
1. Select the cog icon and select `Debug Add-ons`
1. Click the `Load Temporary Add-on...` button
1. Navigate to the build folder for the plug-in and select any file (it doesn't matter which one) and click `Open`

### Chrome

1. Open the `Window` menu and select `Extensions`
1. In the top right toggle `Developer mode` on
1. Click the `Load unpacked` button
1. Navigate to the build folder and click `Select`

## Running 

Open the [Spelling Bee game](https://www.nytimes.com/puzzles/spelling-bee)

If everything is built correctly the Spelling Bee Helper should appear to the left of the Spelling Bee letters.

## Testing

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.
