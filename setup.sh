# ------------------------------------------------------------------------------
# Firewalld Installation
sudo yum install -y firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld
# sudo reboot ->Best practice
sudo firewall-cmd --reload

# ------------------------------------------------------------------------------
# OmniSci Installation
# https://docs.omnisci.com/v4.4.1/4_centos7-yum-cpu-ce-recipe.html
# Please note that it does not work with the latest version, v5


# Create the OmniSci User
sudo yum update
sudo useradd -U mapd

# Firewall rules
sudo firewall-cmd --zone=public --add-port=9092/tcp --permanent
sudo firewall-cmd --reload

# Installation
curl https://releases.mapd.com/ce/mapd-ce-cpu.repo | sudo tee /etc/yum.repos.d/mapd.repo
sudo yum install -y mapd

# Set Environment Variables 
echo "
export MAPD_USER=mapd
export MAPD_GROUP=mapd
export MAPD_STORAGE=/var/lib/mapd
export MAPD_PATH=/opt/mapd
export MAPD_LOG=/var/lib/mapd/data/mapd_log
export DBNAME=meit
" >> ~/.bashrc

source ~/.bashrc

# Initialization
cd $MAPD_PATH/systemd
sudo ./install_mapd_systemd.sh

# Activation
cd $MAPD_PATH
sudo systemctl start mapd_server
sudo systemctl start mapd_web_server

sudo systemctl enable mapd_server
sudo systemctl enable mapd_web_server

# Testing
# cd $MAPD_PATH
# sudo ./insert_sample_data

# User and databases
cd $MAPD_PATH
echo "
ALTER USER mapd (password = '$MAPD_PASSWORD');
CREATE USER eccc (password = '$ECCC_PASSWORD', is_super = 'false');
CREATE DATABASE meit (owner = 'eccc');
CREATE USER publicuser (password = 'password', is_super = 'false');
GRANT ACCESS, SELECT ON DATABASE meit TO publicuser;
" | bin/mapdql mapd -u mapd -p HyperInteractive

# ------------------------------------------------------------------------------
# Git and NodeJS
sudo yum install -y git
curl -sL https://rpm.nodesource.com/setup_10.x | sudo bash -
sudo yum install -y nodejs

# ------------------------------------------------------------------------------
# MEIT Application
# Set Environment Variables 
echo "
export MEIT_PATH=/meit
export MEIT_MBTILES=/meit/data/mbtiles
export MEIT_CSV=/meit/data/csv
export MEIT_PORT=8080
" >> ~/.bashrc

source ~/.bashrc

# Clone repo and install npm packages
sudo mkdir -p $MEIT_PATH
cd $MEIT_PATH
sudo chown -R centos:centos .
git clone https://github.com/Julien-Cousineau/meit2020.git .
npm install


# ------------------------------------------------------------------------------
# Nginx
# Installation
sudo yum install -y epel-release
sudo yum install -y nginx

# Activation
sudo systemctl start nginx
sudo systemctl enable nginx

# Firewall rules
sudo firewall-cmd --permanent --zone=public --add-service=http 
sudo firewall-cmd --permanent --zone=public --add-service=https
sudo firewall-cmd --reload


# Copy files
# 
cd $MEIT_PATH
sudo mkdir /etc/nginx/sites-available
sudo mkdir /etc/nginx/nginxconfig.io
sudo mkdir /etc/nginx/sites-enabled

# !!!Important!!!!!
#CHECK SSL certificate paths in ec-meit.conf and mapd.conf

sudo setsebool httpd_can_network_connect on -P # Allow proxying
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf
sudo cp nginx/ec-meit.conf /etc/nginx/sites-enabled/ec-meit.conf
sudo cp nginx/general.conf /etc/nginx/nginxconfig.io/general.conf
sudo cp nginx/security.conf /etc/nginx/nginxconfig.io/security.conf
sudo cp nginx/proxy.conf /etc/nginx/nginxconfig.io/proxy.conf
sudo openssl dhparam -out /etc/nginx/dhparam.pem 2048 
sudo nginx -t && sudo systemctl reload nginx

# 
cd $MEIT_PATH
sudo cp mapd.conf $MAPD_STORAGE/mapd.conf
sudo systemctl restart mapd_server
sudo systemctl restart mapd_web_server

# ------------------------------------------------------------------------------
# Download vector tiles and latest csv2 for application (.mbtiles and data)
# 
npm run azure-download
npm run download-production-2015
npm run data2db-2015

# Create nodeJS Meit service
sudo cp meit.service /etc/systemd/system/meit.service
systemctl start meit.service
systemctl enable meit.service
