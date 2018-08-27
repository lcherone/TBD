#!/bin/bash

set -a
. ../.env
set +a

date=`date +%Y-%m-%d`
dumppath="/var/www/html/files/sql"
dumpfile="$dumppath/$DB_DATABASE.$date.sql"

mysqldump \
    --add-drop-table \
    --user="$DB_USERNAME" --password="$DB_PASSWORD" --host="127.0.0.1" "$DB_DATABASE" \
 > "$dumpfile"
 
cp $dumpfile $dumppath/$DB_DATABASE.sql