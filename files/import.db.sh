#!/bin/bash

set -a
. ../.env
set +a

dumppath="/var/www/html/files/sql"

cat $dumppath/$DB_DATABASE.sql | mysql --user="$DB_USERNAME" --password="$DB_PASSWORD" $DB_DATABASE