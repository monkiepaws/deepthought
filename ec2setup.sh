sudo yum update
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
. ~/.nvm/nvm.sh
nvm install node
sudo yum install -y git
npm install pm2@latest -g
https://github.com/monkiepaws/polybot.git
cd polybot
npm ci
pm2 startup
pm2 start index.js --name polybot
pm2 save
