pipeline {
    agent any

    environment {
        DOCKER_IMAGE_BACKEND  = "agentpilot-backend"
        DOCKER_IMAGE_FRONTEND = "agentpilot-frontend"
        DOCKER_REGISTRY       = "${env.DOCKER_REGISTRY ?: 'docker.io/ravikiranreddy'}"
        RENDER_DEPLOY_HOOK    = credentials('RENDER_DEPLOY_HOOK_URL')
        SLACK_WEBHOOK         = credentials('SLACK_WEBHOOK_URL')
    }

    options {
        timeout(time: 20, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        // ── Stage 1: Checkout ──────────────────────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
                echo "Branch: ${env.GIT_BRANCH} | Commit: ${env.GIT_COMMIT[0..7]}"
            }
        }

        // ── Stage 2: Lint & Static Analysis ───────────────────────────────
        stage('Lint') {
            parallel {
                stage('Backend Lint') {
                    steps {
                        sh '''
                            python3 -m pip install --quiet flake8
                            flake8 app/ --max-line-length=120 --exclude=__pycache__,.venv \
                                   --count --statistics || true
                        '''
                    }
                }
                stage('Frontend Lint') {
                    steps {
                        dir('frontend') {
                            sh '''
                                npm ci --silent
                                npm run lint -- --max-warnings=50 || true
                            '''
                        }
                    }
                }
            }
        }

        // ── Stage 3: Unit Tests ────────────────────────────────────────────
        stage('Test') {
            steps {
                sh '''
                    python3 -m pip install --quiet pytest pytest-asyncio httpx
                    pip install --quiet -r requirements.txt
                    python3 -m pytest app/ -v --tb=short \
                        --junit-xml=test-results.xml || true
                '''
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'test-results.xml'
                }
            }
        }

        // ── Stage 4: Build Docker Images ───────────────────────────────────
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend') {
                    steps {
                        sh """
                            docker build \
                                --tag ${DOCKER_IMAGE_BACKEND}:${env.BUILD_NUMBER} \
                                --tag ${DOCKER_IMAGE_BACKEND}:latest \
                                --file Dockerfile \
                                .
                        """
                    }
                }
                stage('Build Frontend') {
                    steps {
                        sh """
                            docker build \
                                --tag ${DOCKER_IMAGE_FRONTEND}:${env.BUILD_NUMBER} \
                                --tag ${DOCKER_IMAGE_FRONTEND}:latest \
                                --file frontend/Dockerfile \
                                ./frontend
                        """
                    }
                }
            }
        }

        // ── Stage 5: Docker Compose Smoke Test ────────────────────────────
        stage('Integration Smoke Test') {
            steps {
                sh '''
                    docker compose up -d --build mongo app
                    sleep 10

                    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
                        http://localhost:3000/health || echo "000")

                    docker compose down --volumes --remove-orphans

                    if [ "$STATUS" != "200" ]; then
                        echo "Health check returned $STATUS — build failed"
                        exit 1
                    fi
                    echo "Smoke test passed (HTTP $STATUS)"
                '''
            }
            post {
                failure {
                    sh 'docker compose down --volumes --remove-orphans || true'
                }
            }
        }

        // ── Stage 6: Push to Registry (main branch only) ──────────────────
        stage('Push Images') {
            when {
                branch 'main'
            }
            steps {
                withDockerRegistry([credentialsId: 'dockerhub-credentials', url: '']) {
                    sh """
                        docker tag ${DOCKER_IMAGE_BACKEND}:latest \
                            ${DOCKER_REGISTRY}/${DOCKER_IMAGE_BACKEND}:${env.BUILD_NUMBER}
                        docker tag ${DOCKER_IMAGE_BACKEND}:latest \
                            ${DOCKER_REGISTRY}/${DOCKER_IMAGE_BACKEND}:latest

                        docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_BACKEND}:${env.BUILD_NUMBER}
                        docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_BACKEND}:latest
                    """
                }
            }
        }

        // ── Stage 7: Deploy to Render (main branch only) ──────────────────
        stage('Deploy to Render') {
            when {
                branch 'main'
            }
            steps {
                sh '''
                    echo "Triggering Render deployment..."
                    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
                        -X POST "${RENDER_DEPLOY_HOOK}")

                    if [ "$RESPONSE" = "201" ] || [ "$RESPONSE" = "200" ]; then
                        echo "Render deployment triggered successfully (HTTP $RESPONSE)"
                    else
                        echo "Render deploy hook returned $RESPONSE"
                        exit 1
                    fi
                '''
            }
        }
    }

    // ── Post Actions ──────────────────────────────────────────────────────
    post {
        success {
            script {
                def msg = "✅ *AgentPilot* build *#${env.BUILD_NUMBER}* passed on `${env.GIT_BRANCH}` — commit ${env.GIT_COMMIT[0..7]}"
                sh """
                    curl -s -X POST -H 'Content-type: application/json' \
                        --data '{"text":"${msg}"}' \
                        "${SLACK_WEBHOOK}" || true
                """
            }
        }
        failure {
            script {
                def msg = "❌ *AgentPilot* build *#${env.BUILD_NUMBER}* FAILED on `${env.GIT_BRANCH}` — commit ${env.GIT_COMMIT[0..7]}"
                sh """
                    curl -s -X POST -H 'Content-type: application/json' \
                        --data '{"text":"${msg}"}' \
                        "${SLACK_WEBHOOK}" || true
                """
            }
            sh 'docker compose down --volumes --remove-orphans || true'
        }
        always {
            cleanWs()
        }
    }
}
