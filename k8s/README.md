# ArgoCD 部署指南

本指南介绍如何使用 ArgoCD 在本地 Minikube 部署 Todos 应用。

## 前置条件

1. 已安装并启动 Minikube
2. 已安装并配置 kubectl
3. 已安装 ArgoCD
4. 已将代码推送到 GitHub 仓库

## 部署步骤

### 启动 Minikube

```bash
minikube start
```

### 安装 ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### 暴露 ArgoCD 服务

```bash
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort"}}'
```

### 获取 ArgoCD 密码

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

### 访问 ArgoCD UI

```bash
minikube service argocd-server -n argocd
```

使用用户名 `admin` 和上一步获取的密码登录。

### 部署应用

有两种方式部署应用：

#### 方式一：使用 ArgoCD UI

1. 点击 "New App"
2. 填写以下信息：
   - Application Name: `todos-app`
   - Project: `default`
   - Repository URL: 你的 GitHub 仓库 URL
   - Revision: `HEAD`
   - Path: `k8s`
   - Destination Cluster URL: `https://kubernetes.default.svc`
   - Destination Namespace: `todos`
3. 点击 "Create"
4. 点击 "Sync"

#### 方式二：使用 kubectl

```bash
kubectl apply -f k8s/argocd-application.yaml
```

### 7. 访问应用

```bash
minikube service frontend -n todos
```

## 项目结构

```
todos-fullstack/
├── k8s/                   # Kubernetes 部署文件
│   ├── namespace.yaml     # 命名空间定义
│   ├── mysql.yaml         # MySQL 部署和服务
│   ├── backend.yaml       # 后端部署和服务
│   ├── frontend.yaml      # 前端部署和服务
│   └── argocd-application.yaml  # ArgoCD 应用定义
├── backend/               # 后端代码
├── frontend/              # 前端代码
└── docker-compose.yml     # Docker Compose 配置
```

## 镜像构建

在部署前，你需要构建并推送前端和后端镜像到 Docker Hub 或其他镜像仓库。

### 构建后端镜像

```bash
cd backend
docker build -t yourusername/backend:latest .
docker push yourusername/backend:latest
```

### 构建前端镜像

```bash
cd frontend
docker build -t yourusername/frontend:latest .
docker push yourusername/frontend:latest
```

### 更新 Kubernetes 配置

更新 `k8s/backend.yaml` 和 `k8s/frontend.yaml` 中的镜像名称为你自己的镜像仓库地址。

## 环境变量

应用使用以下环境变量：

### MySQL
- `MYSQL_ROOT_PASSWORD`: MySQL 根密码
- `MYSQL_DATABASE`: 数据库名称
- `MYSQL_USER`: 数据库用户名
- `MYSQL_PASSWORD`: 数据库密码

### 后端
- `SECRET_KEY`: Flask 密钥
- `MYSQL_USER`: 数据库用户名
- `MYSQL_PASSWORD`: 数据库密码
- `DB_HOST`: 数据库主机
- `MYSQL_DATABASE`: 数据库名称

## 监控和日志

### 查看 Pod 状态

```bash
kubectl get pods -n todos
```

### 查看日志

```bash
# 查看后端日志
kubectl logs -n todos deployment/backend

# 查看前端日志
kubectl logs -n todos deployment/frontend

# 查看 MySQL 日志
kubectl logs -n todos deployment/mysql
```

### 查看服务

```bash
kubectl get services -n todos
```

## 卸载应用

### 使用 ArgoCD UI

1. 点击应用名称
2. 点击 "Delete"

### 使用 kubectl

```bash
kubectl delete -f k8s/argocd-application.yaml
```

## 常见问题

1. **应用无法启动**
   - 检查 Pod 日志，查看具体错误信息
   - 确保所有依赖服务都已正常启动

2. **无法访问应用**
   - 检查服务是否已正确创建
   - 检查 Minikube 服务暴露情况

3. **数据库连接失败**
   - 检查 MySQL Pod 是否正常运行
   - 检查环境变量配置是否正确

4. **ArgoCD 同步失败**
   - 检查应用配置是否正确
   - 检查 GitHub 仓库连接是否正常