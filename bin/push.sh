version=$(cat ./version)

# 1. build docker
echo `pwd`
docker build -t ewelink/ewelink-smart-home --platform=linux/arm/v7 .
docker build -t ewelink/ewelink-smart-home:v$version --platform=linux/arm/v7 .

echo $(date +%Y-%m-%d" "%H:%M:%S) '[build image] - done'

# # 2. login docker
# read -p "enter your docker username: " username
# read -s -p "enter your docker password: " password

# docker login -u=$username --password=$password
# echo $(date +%Y-%m-%d" "%H:%M:%S) '[login docker hub account] - done'

# # 3 push docker
# docker push ewelink/ewelink-smart-home
# docker push ewelink/ewelink-smart-home:v$version

# echo $(date +%Y-%m-%d" "%H:%M:%S) '[push image] - done'

# # 4. logout docker
# docker logout

# echo $(date +%Y-%m-%d" "%H:%M:%S) '[docker logout] - done'