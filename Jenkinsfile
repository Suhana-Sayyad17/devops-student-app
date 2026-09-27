pipeline {
    agent any

    environment {
        DOCKER_HUB = credentials('dockerhub-credentials')
        IMAGE_NAME = 'suhanasayyad17/devops-student-management'
        CONTAINER_NAME = 'student-app'
    }

    stages {
        stage('Checkout SCM') {
            steps {
                echo 'Fetching source code from GitHub...'
                checkout scm
            }
        }

        stage('Verify Environment') {
            steps {
                sh 'node --version'
                sh 'npm --version'
                sh 'docker --version'
                sh 'ansible --version || true'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build & Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} -t ${IMAGE_NAME}:latest .'
            }
        }

        stage('Docker Push') {
            steps {
                sh '''
                    echo "$DOCKER_HUB_PSW" | docker login -u "$DOCKER_HUB_USR" --password-stdin
                    docker push ${IMAGE_NAME}:${BUILD_NUMBER}
                    docker push ${IMAGE_NAME}:latest
                    docker logout
                '''
            }
        }

        stage('Deploy with Ansible') {
            steps {
                sh '''
                    ansible-playbook -i ansible/inventory.ini ansible/deploy.yml \
                    --extra-vars "image=${IMAGE_NAME}:latest"
                '''
            }
        }

        stage('Smoke Test') {
            steps {
                sh '''
                    sleep 5
                    curl -f http://localhost:3000/api/health
                '''
            }
        }
    }

    post {
        always {
            echo "Pipeline execution complete. Build: ${BUILD_NUMBER}"
        }
        success {
            echo 'CI/CD Pipeline completed successfully!'
        }
        failure {
            echo 'CI/CD Pipeline failed. Check Jenkins console output.'
        }
    }
}
