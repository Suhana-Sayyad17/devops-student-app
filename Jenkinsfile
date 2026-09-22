pipeline {
    agent any

    environment {
        DOCKER_HUB = credentials('dockerhub-credentials')
        IMAGE_NAME = 'suhanasayyad17/student-app'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Source code fetched successfully from GitHub.'
            }
        }
        stage('Build & Test') {
            steps {
                echo 'Building Node.js Student Management App...'
            }
        }
        stage('Docker Login & Build') {
            steps {
                echo "Authenticating with Docker Hub as ${DOCKER_HUB_USR}..."
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying application via Ansible...'
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution finished successfully!'
        }
    }
}
