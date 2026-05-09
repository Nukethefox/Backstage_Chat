# Backstage_Chat

This chat is intended for communication whithout internet connection, just local wifi.

Usage instructions: 
1. You will need a local WiFi router/access point with enough power to cover your room (keep in mind walls on backstage... you might need a wifi repeater). Make sure your device and other devices (e.g backstage ipad) are on the same network.
2. You will need a "main" device (server device from now on), for example, your MacBook at FOH.
3. On your server device, download the files and subfolder from this repo and place them on the same master folder. Then install node.js. Then open a terminal on the master folder and run "node server.js".
4. On your server device, open 127.0.0.1:3000 on your browser. On the other devices, use the IP from your server device

Each device will have a username. The new messages will blink until mark as received.
Keep in mind you don't need internet access to use the chat, but you will need stable connection between your devices.

When done using it, close it using CTRL+C on the terminal, open the file messages.json and delete everything, to empty the chat history. Just don't delete the "[" at the begining and the "]" at the end
