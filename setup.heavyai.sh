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
# sudo yum update
# sudo useradd -U mapd

# # Firewall rules
# sudo firewall-cmd --zone=public --add-port=9092/tcp --permanent
# sudo firewall-cmd --reload

# # Installation
# curl https://releases.mapd.com/ce/mapd-ce-cpu.repo | sudo tee /etc/yum.repos.d/mapd.repo
# sudo yum install -y mapd

# Set Environment Variables 
echo "

export MEIT_PORT=8080
export MAPD_PORT=6278
export DBNAME=meit

export MEIT_PATH=/opt/meit
export MEIT_DATA=/var/lib/heavyai/nrc-data-files
export MEIT_MBTILES=/var/lib/heavyai/nrc-data-files/mbtiles
export MEIT_CSV=/var/lib/heavyai/nrc-data-files/csv

export HEAVYAI_CONF=/var/lib/heavyai/heavy.conf
export HEAVYAI_STORAGE=/var/lib/heavyai
export HEAVYAI_PATH=/opt/heavyai
export HEAVYAI_LOG=/var/lib/heavyai/storage/log
export DBNAME=meit
" >> ~/.bashrc

source ~/.bashrc

# Initialization
cd $HEAVYAI_PATH/systemd
sudo ./install_mapd_systemd.sh

sudo cp mapd.conf $HEAVYAI_STORAGE/mapd.conf

# Activation
cd $HEAVYAI_PATH
sudo systemctl start mapd_server
sudo systemctl start mapd_web_server

sudo systemctl enable mapd_server
sudo systemctl enable mapd_web_server

# Testing
# cd $HEAVYAI_PATH
# sudo ./insert_sample_data

# User and databases
cd $HEAVYAI_PATH
echo "
# ALTER USER admin (password = '$MAPD_PASSWORD');
# CREATE USER eccc (password = '$ECCC_PASSWORD', is_super = 'false');
CREATE DATABASE meit;
CREATE USER publicuser (password = 'password', is_super = 'false');
GRANT ACCESS, SELECT ON DATABASE meit TO publicuser;
" | bin/heavysql heavyai -u admin -p HyperInteractive



# ------------------------------------------------------------------------------
# Git and NodeJS
sudo yum install -y git
curl -sL https://rpm.nodesource.com/setup_10.x | sudo bash -
sudo yum install -y nodejs



# Clone repo and install npm packages
sudo mkdir -p $MEIT_PATH
cd $MEIT_PATH
sudo chown -R centos:centos .
git clone https://github.com/Julien-Cousineau/meit2020.git .

#Red hat 
alternatives --set python /usr/bin/python3

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

sudo cp nginx/ec-meit.test.conf /etc/nginx/sites-enabled/ec-meit.conf

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
sudo systemctl start meit.service
sudo systemctl enable meit.service


export DBNAME=meit
export MAPD_USER=admin
export MAPD_PASSWORD=HyperInteractive
export MAPD_PORT=6278
export MEIT_CSV=/var/lib/omnisci/nrc-data-files/

export MEIT_CSV=/home/julien.cousineau/meit/data/

export DBNAME=meit
export MAPD_USER=admin
export MAPD_PASSWORD=HyperInteractive
export MAPD_PORT=9090

# LOGS
cd /var/lib/omnisci/data/mapd_log
vim /var/lib/omnisci/omnisci.conf

/var/lib/omnisci/nrc-data-files/
sudo systemctl restart nginx
sudo systemctl restart omnisci_server

