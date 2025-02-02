#!/bin/bash

# Give executable permissions to pocketbase.exe
chmod +x ./database/pocketbase_linux

# Start pocketbase and the development server
./database/pocketbase_linux serve & npm i && npm run dev