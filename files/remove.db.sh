#!/bin/bash

sudo apt-get -y purge --auto-remove mariadb-server
sudo apt-get -y purge --auto-remove mariadb-client

rm /var/www/html/files/adminer.php