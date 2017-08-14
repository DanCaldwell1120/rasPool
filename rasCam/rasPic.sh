#!/bin/sh

OPTIONS='-q 30 -x'
DATE=$(date +"%m/%d/%Y")
HOUR=$(date +"%R")

cd /tmp
raspistill -o image.jpg $OPTIONS

convert image.jpg -pointsize 64 \
	-fill white -stroke black -strokewidth 1 -annotate +2020+1920 $DATE \
	-fill white -stroke black -strokewidth 1 -annotate +2380+1920 $HOUR \
poolPic.jpg

scp poolPic.jpg meteorjs@192.168.57.192:/var/www/meteor/
