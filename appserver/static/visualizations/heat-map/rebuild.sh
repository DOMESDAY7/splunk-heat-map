yarn run build

bump=`cat $SPLUNK_HOME/var/run/splunk/push-version.txt`
echo "Current version: $bump"
let bump++
echo -n $bump > $SPLUNK_HOME/var/run/splunk/push-version.txt
echo "New version:  $bump"
