#!/bin/bash

cd ~/ogtl-erp-application
cp /home/ubuntu/.env ~/ogtl-erp-application/
pm2 startOrReload ecosystem.config.js
