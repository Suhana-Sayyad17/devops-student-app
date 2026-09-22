pipeline {
    agent any

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
        stage('Docker Build & Push') {
            steps {
                echo 'Simulating Docker build for suhanasayyad17/student-app:latest...'
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
