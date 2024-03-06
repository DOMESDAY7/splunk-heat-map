# Calendar heat map custom Splunk vizualisation

![splunk-calendar-heat-map](https://github.com/DOMESDAY7/splunk-heat-map/assets/79838340/b1cd8f04-999b-48b4-baf6-da0f92791f16)

## Prerequisites

✅ Splunk install
✅ Nodejs install
✅ yarn install
✅ environment SPLUNK_HOME set

## On \*inx

You need to modify the package.json file because I set the `%SPLUNK_HOME%` variable with the windows notation. With Unix distrib you need to write `$SPLUNK_HOME`.

## On Windows

It just works.

## How to run this project ?

1 - Put this project in your %SPLUNK_HOME%/etc/apps.
2 - Install all the dependencies by execute yarn in the %SPLUNK_HOME%/etc/apps/heat-map/appserver/static/visualizations/heat-map directory
3 - Now you just need to reload your Splunk instance. (In Splunk go to Settings > Server control > Restart Splunk)

### Search example

If you want to see the heat map display, go to search and paste the following search into the entry:

```spl
| makeresults count=50
| eval random_days = floor(random() % 28),
      random_seconds = random() % 86400,
      base_time = strptime("2024-12-01", "%Y-%m-%d")
| eval _time = base_time + (random_days * 86400) + random_seconds
| eval threshold_critical=round(random() % 100, 2),
      threshold_moderate=round(random() % 50, 2),
      value=round(random() % 100, 2)
| table _time, threshold_critical, threshold_moderate, value
```

Go to visualization and select Heat map.

If you want to test the multimonth visualization you just have to do the same things with this search:

```spl
| makeresults count=200
| eval random_month = floor(random() % 12),
      random_days = floor(random() % 28),
      random_seconds = random() % 86400,
      base_time = strptime("2024-02-01", "%Y-%m-%d")
| eval _time = base_time + (random_month * 2629743) + (random_days * 86400) + random_seconds
| eval threshold_critical=round(random() % 100, 2),
      threshold_moderate=round(random() % 50, 2),
      value=round(random() % 100, 2)
| table _time, threshold_critical, threshold_moderate, value
```

## How to modify this project ?

To customize, bring new idea you just have to modify the vizualisation_source.js file in `src/` folder be carefull because you can't add external dependencie easly because Splunk use an old version of nodejs (on mine it was nodejs 8 ☠️) so you have to write your code with require ...etc

## Command

`yarn test` : to start test file (all the files \*.spec.js)
`yarn build` : important to see your change

# Package correctly the app

Source : [Package an app](https://dev.splunk.com/enterprise/tutorials/module_validate/packageapp)

You need to install few more things bundle in one pip package available with this command :

```bash
pip install splunk-packaging-toolkit-1.0.1.tar.gz
```

go to the apps directory

```bash
cd $SPLUNK_HOME/etc/apps
```

generate the manifest with the app

```bash
slim generate-manifest calendar-heat-map -o calendar-heat-map/app.manifest
```

If you have a `[moderate]` tag tou need to add the stanza `[package]` to the /calendar-heat-map/default/app.conf file normaly it's already done. If not here his wath you should paste in the app.conf :

```bash
[package]
id = devtutorial
```

Regenerate the manifest if you add a moderate.

Now, to use the package in your Splunk cloud instance you need to do few more things :

- delete the appserver/static/visualizations/heat-map/node_modules
- delete all git file and director, here is a list : - .git - .gitignore - .gitkeep
- configure the rights for each directory like :

```bash
icacls "calendar-heat-map" /grant "userName:(R,W)" /T
```

and

```bash
icacls "heat-map" /remove:g *S-1-1-0 *S-1-5-32-545 /T
```

## Usefull link

[Formatter API ref](https://docs.splunk.com/Documentation/SplunkCloud/9.1.2308/AdvancedDev/CustomVizFormatterApiRef)
[Splunk dev](https://dev.splunk.com/enterprise/docs/devtools/customalertactions/createuicaa)
[developp custom visualization](https://docs.splunk.com/Documentation/Splunk/9.2.0/AdvancedDev/CustomVizTutorial)
