#docker build -t webapicsharp:net9 -f Dockerfile .

#docker run -p 5031:5031 webapicsharp:net9


#-- kubernetes
minikube start  #para inicializar minikube
eval $(minikube docker-env)  #para usar la imagen de docker en minikube

docker build -t webapicsharp:1.0 -f Dockerfile . #construir la imagen de docker

kubectl create namespace webapicsharp # crear un namespace para organizar los recursos de kubernetes
kubectl config set-context --current --namespace=webapicsharp # configurar el contexto actual para usar el namespace creado

kubectl apply -f k8s/mariadb-secrets.yaml
kubectl apply -f k8s/mariadb-pvcs.yaml

#minikube mount /home/epayco21/Escritorio/itm/webapicsharp/back/webapicsharp:/mnt/www

kubectl apply -f k8s/mariadb-statefulset.yaml
kubectl apply -f k8s/mariadb-service.yaml
# correr los siguientes comandos para desplegar en kubernetes
kubectl apply -f k8s/webapicsharp-deployment.yaml  #desplegar en kubernetes
kubectl apply -f k8s/webapicsharp-service.yaml  #exponer el servicio

minikube tunnel

# external_ip:port/  => http://10.106.255.167:6001/swagger/index.html

#contenedor mysql
kubectl exec -it <nombre-del-pod> -- bash
kubectl exec -it mariadb-0 -- bash
mysql -u root -p