cd $MEIT_PATH
sudo yum install -y certbot
sudo mkdir /etc/nginx/sites-available
sudo mkdir /etc/nginx/nginxconfig.io
sudo mkdir /etc/nginx/sites-enabled


sudo setsebool httpd_can_network_connect on -P

sudo cp nginx/nginx.conf /etc/nginx/nginx.conf
sudo cp nginx/ec-meit.test.conf /etc/nginx/sites-enabled/ec-meit.conf
sudo cp nginx/letsencrypt.conf /etc/nginx/nginxconfig.io/letsencrypt.conf
sudo cp nginx/general.conf /etc/nginx/nginxconfig.io/general.conf
sudo cp nginx/security.conf /etc/nginx/nginxconfig.io/security.conf
sudo cp nginx/proxy.conf /etc/nginx/nginxconfig.io/proxy.conf
sudo openssl dhparam -out /etc/nginx/dhparam.pem 2048 

sudo mkdir -p /var/www/letsencrypt/.well-known/acme-challenge
sudo chown centos /var/www/letsencrypt
chcon -Rt httpd_sys_content_t /var/www/letsencrypt/

sudo sed -i -r 's/(listen .*443)/\1;#/g; s/(ssl_(certificate|certificate_key|trusted_certificate) )/#;#\1/g' /etc/nginx/sites-enabled/ec-meit.conf
sudo nginx -t && sudo systemctl reload nginx
sudo certbot certonly --webroot -d ocremap.ca -d www.ocremap.ca --email julien.cousineau@gmail.com -w /var/www/letsencrypt -n --agree-tos --force-renewal
sudo sed -i -r 's/#?;#//g' /etc/nginx/sites-enabled/ec-meit.conf
sudo nginx -t && sudo systemctl reload nginx
echo -e '#!nginx -t && systemctl reload nginx' | sudo tee /etc/letsencrypt/renewal-hooks/post/nginx-reload.sh
sudo chmod a+x /etc/letsencrypt/renewal-hooks/post/nginx-reload.sh
sudo cp meit.test.service /etc/systemd/system/meit.service
sudo systemctl start meit.service
sudo systemctl enable meit.service

curl -O https://repo.anaconda.com/archive/Anaconda3-5.3.1-Linux-x86_64.sh
sha256sum Anaconda3-5.3.1-Linux-x86_64.sh
bash Anaconda3-5.3.1-Linux-x86_64.sh
source ~/.bashrc
conda create -n myenv python=3.6
conda activate myenv 
conda install -c conda-forge pymapd=0.10