#!/bin/bash

set -a
. ../.env
set +a

#
# Preset Selections
sudo debconf-set-selections <<< "mariadb-server-10.0 mysql-server/root_password password $DB_ROOTPASS"
sudo debconf-set-selections <<< "mariadb-server-10.0 mysql-server/root_password_again password $DB_ROOTPASS"
#
# Install
sudo apt-get -yqq install mariadb-server
sudo apt-get -yqq install mariadb-client
#
sudo service mysql start
#
# Set root user password
sudo mysql -u root -p$DB_ROOTPASS -e "CREATE DATABASE \`$DB_DATABASE\` /*\!40100 DEFAULT CHARACTER SET utf8 */;"
sudo mysql -u root -p$DB_ROOTPASS -e "CREATE USER $DB_USERNAME@'%' IDENTIFIED BY '$DB_PASSWORD';"
sudo mysql -u root -p$DB_ROOTPASS -e "GRANT ALL PRIVILEGES ON \`$DB_DATABASE\`.* TO '$DB_USERNAME'@'%';"
sudo mysql -u root -p$DB_ROOTPASS -e "GRANT ALL PRIVILEGES on *.* to 'root'@'%' IDENTIFIED BY '$DB_ROOTPASS';"
sudo mysql -u root -p$DB_ROOTPASS -e "FLUSH PRIVILEGES;"
#
sudo service mysql restart
#
# download adminer database tool
wget http://www.adminer.org/latest.php -O /var/www/html/files/adminer.php