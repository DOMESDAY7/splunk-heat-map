# Heat map custom Splunk vizualisation

## Prerequisites

✅ Splunk install
✅ Nodejs install
✅ yarn install
✅ environment SPLUNK_HOME set

## On *inx

You need to modify the package.json file because I set the `%SPLUNK_HOME%` variable with the windows notation. With Unix distrib you need to write `$SPLUNK_HOME`.

## How to run this project ?

1 - Put this project in your %SPLUNK_HOME%/etc/apps.
2 - Install all the dependencies by execute yarn in the %SPLUNK_HOME%/etc/apps/heat-map/appserver/static/visualizations/heat-map directory
3 - Now you just need to reload your Splunk instance. (In Splunk go to Settings > Server control > Restart Splunk)

## How to modify this project ?

To customize, bring new idea you just have to modify the vizualisation_source.js file in `src/` folder be carefull because you can't add external dependencie easly because Splunk use an old version of nodejs (on mine it was nodejs 8 ☠️) so you have to write your code with require ...etc 

## Command

`yarn test` : to start test file (all the files *.spec.js)
`yarn build` : important to see your change
