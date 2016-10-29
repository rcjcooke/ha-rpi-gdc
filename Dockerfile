FROM hypriot/rpi-node:latest
MAINTAINER rcjcooke

# Check to see if Raspbian needs updating, update it and cleanout the apt-get cache afterwards
# to keep image size down
RUN apt-get update && apt-get dist-upgrade && apt-get clean

# Install the rpi-gpio Node.js module we need to be able to access GPIO from Node.js
RUN npm install rpi-gpio

# Retrieve and clone the latest version of the Node.js HomeKit Accessory Server
RUN cd \
      && git clone https://github.com/KhaosT/HAP-NodeJS

# Copy across our heater controller accessory definition
COPY accessories/garage_door_controller_accessory.js accessories/garage_door_controller_accessory.js

# Note: This container requires specifal privaleges to access the Pi GPIO. The
# docker run command should look something like:
# docker run --device /dev/ttyAMA0:/dev/ttyAMA0 --device /dev/mem:/dev/mem --privileged -ti hypriot/wiringpi /loldht 8

# Start up the Node server
ENTRYPOINT ["node", "Core.js"]
# Default to GPIO4
CMD ["4"]
