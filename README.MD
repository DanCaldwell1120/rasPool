rasPool

downloaded and saved to sd card the full raspian operating system from raspberrypi.org

bootup with hdmi output and wireless keyboard to setup wifi network.  While using GUI, enable ssh

install meteor using the most recent stable build for ARM from github
-	check meteor version which installs many dependencies

create a meteor project

copy most recent rasPool code over including client, server, lib (collections), and public (images).

pull down npm dependencies
meteor npm install --save meteor-node-stubs

meteor add http (API call for air temperature)

meteor add accounts-ui accounts-password

meteor npm install --save python-shell

meteor add iron:router

// DS18B20 temperature probe – Assumes GPIO 27 is connected to the data line
sudo vim /boot/config
add “dtoverlay=w1-gpio,gpiopin=27” 
save file
sudo reboot
sudo modprobe w1-gpio
sudo modprobe w1-therm
//temp data will be available in /sys/bus/w1/devices/xx-xxxxxxxx/w1_slave

// Initial poolPic.jpg
Need add default pic at /tmp/poolPic.jpg or the app will crash


Start meteor app


Need to set raspberry pi system time

Setup local git repository (DanCaldwell1120/rasPool)


Camera pi
ssh-keygen –t rsa (hit enter for file location and twice for passphrase)
copy id_rsa.pub contents into ~/.ssh/authorized_keys on rasPool
sudo raspi-config
-	5. Interfacing Options
-	PI Camera / Yes

Crontab – Run raspic.sh every minute (or specified time)
-take picture every minute 
-scp poolPic.jpg meteorjs@raspool:/tmp/poolPic.jpg

