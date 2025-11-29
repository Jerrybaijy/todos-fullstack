# ArgoCD 部署指南 - Helm 版本

本指南介绍如何使用 ArgoCD 和 Helm 图表在本地 Minikube 部署 Todos 应用。

## 前置条件

1. 已安装并启动 Minikube
2. 已安装并配置 kubectl
3. 已安装 ArgoCD
4. 已安装 Helm
5. 已将代码推送到 GitHub 仓库

## 部署步骤

### 1. 启动 Minikube

```bash
minikube start
```

### 2. 安装 ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### 3. 暴露 ArgoCD 服务

```bash
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort"}}'
```

### 4. 获取 ArgoCD 密码

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

### 5. 访问 ArgoCD UI

```bash
minikube service argocd-server -n argocd
```

使用用户名 `admin` 和上一步获取的密码登录。

### 6. 部署应用

#### 方式一：使用 ArgoCD UI

1. 点击 "New App"
2. 填写以下信息：
   - Application Name: `todos-app-helm`
   - Project: `default`
   - Repository URL: 你的 GitHub 仓库 URL
   - Revision: `HEAD`
   - Path: `helm/todos-app`
   - Destination Cluster URL: `https://kubernetes.default.svc`
   - Destination Namespace: `todos-helm`
3. 在 "Helm" 部分添加或修改 values：
   ```yaml
   mysql:
     rootPassword: rootpassword
     database: todos_db
     user: todosuser
     password: todospassword
   backend:
     secretKey: your-secret-key
     image:
       repository: yourusername/backend
       tag: latest
   frontend:
     image:
       repository: yourusername/frontend
       tag: latest
   ```
4. 点击 "Create"
5. 点击 "Sync"

#### 方式二：使用 kubectl

1. 更新 `helm/argocd-application-helm.yaml` 文件中的以下内容：
   - `repoURL`: 你的 GitHub 仓库 URL
   - `backend.image.repository`: 你的后端镜像仓库地址
   - `frontend.image.repository`: 你的前端镜像仓库地址

2. 应用 ArgoCD Application 配置：
   ```bash
   kubectl apply -f helm/argocd-application-helm.yaml
   ```

### 7. 访问应用

```bash
minikube service todos-app-frontend -n todos-helm
```

## 项目结构

```
todos-fullstack/
├── helm/                  # Helm 图表目录
│   ├── argocd-application-helm.yaml  # ArgoCD 应用定义（Helm 版本）
│   └── todos-app/         # Helm 图表
│       ├── Chart.yaml     # 图表元数据
│       ├── values.yaml    # 图表配置默认值
│       ├── templates/     # 模板文件
│       │   ├── namespace.yaml    # 命名空间模板
│       │   ├── mysql.yaml        # MySQL 模板
│       │   ├── backend.yaml      # 后端模板
│       │   └── frontend.yaml     # 前端模板
│       └── .helmignore    # Helm 忽略文件
├── k8s/                   # Kubernetes 配置文件（传统方式）
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

## Helm 命令

### 安装 Helm

```bash
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh
sudo ./get_helm.sh
```

### 本地测试 Helm 图表

```bash
# 打包 Helm 图表
helm package helm/todos-app

# 安装 Helm 图表到本地 Minikube
helm install todos-app ./todos-app-0.1.0.tgz --namespace todos-helm --create-namespace

# 查看已安装的 Helm 发布
helm list -n todos-helm

# 升级 Helm 发布
helm upgrade todos-app ./todos-app-0.1.0.tgz --namespace todos-helm

# 卸载 Helm 发布
helm uninstall todos-app --namespace todos-helm
```

### 检查 Helm 图表语法

```bash
helm lint helm/todos-app
```

### 查看 Helm 模板渲染结果

```bash
helm template todos-app helm/todos-app --namespace todos-helm
```

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
kubectl get pods -n todos-helm
```

### 查看日志

```bash
# 查看后端日志
kubectl logs -n todos-helm deployment/todos-app-backend

# 查看前端日志
kubectl logs -n todos-helm deployment/todos-app-frontend

# 查看 MySQL 日志
kubectl logs -n todos-helm deployment/todos-app-mysql
```

### 查看服务

```bash
kubectl get services -n todos-helm
```

## 卸载应用

### 使用 ArgoCD UI

1. 点击应用名称
2. 点击 "Delete"

### 使用 kubectl

```bash
kubectl delete -f helm/argocd-application-helm.yaml
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

5. **Helm 模板渲染失败**
   - 使用 `helm lint` 检查图表语法
   - 使用 `helm template` 查看渲染结果

## 高级配置

### 自定义资源限制

在 `values.yaml` 文件中添加或修改以下内容：

```yaml
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 200m
    memory: 256Mi
```

### 启用自动扩缩容

在 `values.yaml` 文件中添加或修改以下内容：

```yaml
autoscaling:
  enabled: true
  minReplicas: 1
  maxReplicas: 3
  targetCPUUtilizationPercentage: 80
```

### 使用私有镜像仓库

1. 创建 Docker Registry Secret：
   ```bash
   kubectl create secret docker-registry regcred --docker-server=registry.example.com --docker-username=yourusername --docker-password=yourpassword --docker-email=youremail@example.com -n todos-helm
   ```

2. 在 `values.yaml` 文件中添加以下内容：
   ```yaml
   imagePullSecrets:
     - name: regcred
   ```

## 参考资料

- [ArgoCD 官方文档](https://argo-cd.readthedocs.io/)
- [Helm 官方文档](https://helm.sh/docs/)
- [Minikube 官方文档](https://minikube.sigs.k8s.io/docs/)
- [Kubernetes 官方文档](https://kubernetes.io/docs/)