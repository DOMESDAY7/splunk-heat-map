# Ensure that SPLUNK_HOME is set
if [ -z "$SPLUNK_HOME" ]; then
    echo "SPLUNK_HOME is not set. Please set SPLUNK_HOME environment variable."
    exit 1
fi

# Ensure that pip is installed
if ! command -v pip > /dev/null; then
    echo "pip is not installed. Please install pip."
    exit 1
fi

# Ensure that slim is installed
if ! command -v slim > /dev/null; then
    echo "slim is not installed. Please install slim."
    exit 1
fi

# make a copy of the app

cd $SPLUNK_HOME/etc/apps

echo "Copying calendar-heat-map to calendar-heat-map-bundle"
sudo cp -R calendar-heat-map calendar-heat-map-bundle

# generate the manifest
# echo "generating manifest"
# slim generate-manifest calendar-heat-map-bundle -o calendar-heat-map-bundle/app.manifest

echo "remove git files"

# remove git files in the bundle
rm -rf calendar-heat-map-bundle/.git
rm -rf calendar-heat-map-bundle/.gitignore

# remove node_modules
rm -rf calendar-heat-map-bundle/appserver/static/visualizations/calendar-heat-map/node_modules

# generate the splunk package app
echo "create the splunk package"

cd $SPLUNK_HOME/bin

./splunk.exe package app calendar-heat-map-bundle -o $SPLUNK_HOME/etc/apps/calendar-heat-map/appserver/static/visualizations/calendar-heat-map/calendar-heat-map.zip

echo "remove the bundle"
rm -rf calendar-heat-map-bundle