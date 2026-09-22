pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKER_IMAGE = 'suhanasayyad17/devops-student-app:latest'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE .'
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
                sh 'docker push $DOCKER_IMAGE'
            }
        }

        stage('Deploy via Ansible') {
            steps {
                sh 'ansible-playbook deploy.yml'
            }
        }
    }

    post {
        always {
            sh 'docker logout'
        }
    }
}
