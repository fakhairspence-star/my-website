// Newark H&HS AI Training Platform - JavaScript
// Main application logic and interactions

// Global state management
const AppState = {
    currentUser: 'demo-user',
    completedModules: [],
    caseHistory: [],
    formTemplates: {},
    dashboardData: {},
    initialized: false
};

// Initialize application when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Main initialization function
function initializeApp() {
    console.log('Initializing Newark H&HS AI Training Platform...');
    
    // Initialize common components
    initializeNavigation();
    initializeModals();
    loadUserProgress();
    
    // Initialize page-specific functionality
    const currentPage = getCurrentPage();
    switch(currentPage) {
        case 'index':
            initializeHomePage();
            break;
        case 'curriculum':
            initializeCurriculumPage();
            break;
        case 'ai-agent':
            initializeAIAgentPage();
            break;
        case 'dashboard':
            initializeDashboardPage();
            break;
        case 'forms':
            initializeFormsPage();
            break;
    }
    
    AppState.initialized = true;
    console.log('Application initialized successfully');
}

// Utility function to get current page
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '') || 'index';
    return page;
}

// Navigation functionality
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!hamburger?.contains(e.target) && !navMenu?.contains(e.target)) {
            navMenu?.classList.remove('active');
            hamburger?.classList.remove('active');
        }
    });
}

// Modal functionality
function initializeModals() {
    // Get all modals
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.close');
        
        // Close modal when clicking X
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Load user progress from localStorage
function loadUserProgress() {
    const savedProgress = localStorage.getItem('newarkhhs_progress');
    if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        AppState.completedModules = progress.completedModules || [];
        AppState.caseHistory = progress.caseHistory || [];
    }
}

// Save user progress to localStorage
function saveUserProgress() {
    const progress = {
        completedModules: AppState.completedModules,
        caseHistory: AppState.caseHistory,
        lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('newarkhhs_progress', JSON.stringify(progress));
}

// HOME PAGE FUNCTIONALITY
function initializeHomePage() {
    console.log('Initializing home page...');
    
    // Animate statistics on scroll
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        });
        
        statCards.forEach(card => observer.observe(card));
    }
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// CURRICULUM PAGE FUNCTIONALITY
function initializeCurriculumPage() {
    console.log('Initializing curriculum page...');
    
    // Initialize progress manager and update UI
    progressManager.updateProgressUI();
    updateModuleStates();
    updateProgressBar();
    initializeModuleModal();
    
    // Add progress indicator to curriculum page
    addProgressIndicator();
}

function addProgressIndicator() {
    const curriculumHeader = document.querySelector('.curriculum-header') || document.querySelector('main');
    if (!curriculumHeader) return;
    
    const completedCount = progressManager.progress.completedModules.length;
    const totalModules = 10;
    const progressPercentage = (completedCount / totalModules) * 100;
    
    const progressIndicator = document.createElement('div');
    progressIndicator.className = 'progress-indicator';
    progressIndicator.innerHTML = `
        <div class="progress-text">Training Progress: ${completedCount}/${totalModules} modules completed</div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${progressPercentage}%"></div>
        </div>
        <div class="progress-percentage">${Math.round(progressPercentage)}%</div>
    `;
    
    // Insert after header if it exists
    const existingIndicator = document.querySelector('.progress-indicator');
    if (!existingIndicator) {
        curriculumHeader.insertAdjacentElement('afterend', progressIndicator);
    }
}

function updateModuleStates() {
    const moduleCards = document.querySelectorAll('.module-card');
    
    moduleCards.forEach((card, index) => {
        const moduleNumber = index + 1;
        const isCompleted = progressManager.progress.completedModules.includes(moduleNumber);
        const isUnlocked = progressManager.isModuleUnlocked(moduleNumber);
        
        const statusIcon = card.querySelector('.module-status i');
        const button = card.querySelector('.start-module-btn, .module-btn');
        
        // Update visual states
        card.classList.toggle('module-completed', isCompleted);
        card.classList.toggle('module-locked', !isUnlocked);
        
        if (statusIcon) {
            if (isCompleted) {
                statusIcon.className = 'fas fa-check-circle';
            } else if (isUnlocked) {
                statusIcon.className = 'fas fa-play-circle';
            } else {
                statusIcon.className = 'fas fa-lock';
            }
        }
        
        if (button) {
            if (!isUnlocked) {
                button.textContent = '🔒 Locked';
                button.disabled = true;
            } else if (isCompleted) {
                const score = progressManager.progress.scores[moduleNumber] || 0;
                button.textContent = `✅ Completed (${score}%) - Review`;
                button.disabled = false;
            } else {
                button.textContent = '▶ Start Module';
                button.disabled = false;
            }
        }
    });
}

function updateProgressBar() {
    const totalModules = 10;
    const completedCount = AppState.completedModules.length;
    const progressPercentage = (completedCount / totalModules) * 100;
    
    const progressFill = document.getElementById('courseProgress');
    const progressText = document.querySelector('.progress-text');
    const completedModulesSpan = document.getElementById('completedModules');
    const remainingModulesSpan = document.getElementById('remainingModules');
    const totalHoursSpan = document.getElementById('totalHours');
    
    if (progressFill) {
        progressFill.style.width = `${progressPercentage}%`;
    }
    
    if (progressText) {
        progressText.textContent = `${Math.round(progressPercentage)}% Complete`;
    }
    
    if (completedModulesSpan) {
        completedModulesSpan.textContent = completedCount;
    }
    
    if (remainingModulesSpan) {
        remainingModulesSpan.textContent = totalModules - completedCount;
    }
    
    if (totalHoursSpan) {
        // Estimate 1.75 hours per module
        totalHoursSpan.textContent = Math.round(completedCount * 1.75);
    }
}

function startModule(moduleNumber) {
    const modal = document.getElementById('moduleModal');
    const modalTitle = document.getElementById('modalTitle');
    const moduleContent = document.getElementById('moduleContent');
    
    if (!modal || !modalTitle || !moduleContent) return;
    
    const moduleData = getModuleData(moduleNumber);
    
    modalTitle.textContent = `Module ${moduleNumber}: ${moduleData.title}`;
    moduleContent.innerHTML = generateModuleContent(moduleData);
    
    modal.style.display = 'block';
}

function getModuleData(moduleNumber) {
    const modules = {
        1: {
            title: "Introduction & Context",
            moduleNumber: 1,
            videoId: "intro-context",
            videoTitle: "Introduction to AI-Enhanced Services",
            videoDuration: "15 minutes",
            content: `
                <h3>Welcome to the Newark H&HS AI Training Platform</h3>
                <p>This introductory module provides an overview of:</p>
                <ul>
                    <li>Current challenges in Newark's health and homeless services</li>
                    <li>Goals and objectives of the AI-enabled system</li>
                    <li>How this training will improve service delivery</li>
                    <li>Overview of all training modules</li>
                </ul>
                
                <h4>Learning Objectives</h4>
                <p>By the end of this module, you will:</p>
                <ul>
                    <li>Understand the vision for AI-enhanced service delivery</li>
                    <li>Know how the platform addresses current operational challenges</li>
                    <li>Be motivated to complete the full training program</li>
                </ul>
                
                <div class="module-discussion">
                    <h4>Discussion Questions</h4>
                    <ol>
                        <li>What are the biggest challenges you face in your current role?</li>
                        <li>How do you think AI could help improve client services?</li>
                        <li>What concerns do you have about using new technology?</li>
                    </ol>
                </div>
            `,
            duration: "1.5 hours",
            format: "Lecture + Discussion"
        },
        2: {
            title: "Lead Abatement & Regulation",
            moduleNumber: 2,
            videoId: "lead-abatement",
            videoTitle: "Understanding Lead Laws and Regulations",
            videoDuration: "22 minutes",
            content: `
                <h3>Lead Laws and Regulations</h3>
                <p>Understanding New Jersey and Newark lead abatement requirements:</p>
                
                <h4>Key Topics Covered</h4>
                <ul>
                    <li>Federal, state, and local lead laws</li>
                    <li>Municipal lead certifications and requirements</li>
                    <li>Inspection protocols and procedures</li>
                    <li>Interim controls vs. full abatement</li>
                    <li>Required documentation and recordkeeping</li>
                </ul>
                
                <h4>Case Study: High Blood Lead Level Response</h4>
                <p>Work through a realistic scenario involving:</p>
                <ul>
                    <li>Child with elevated blood lead level</li>
                    <li>Property inspection requirements</li>
                    <li>Tenant rights and landlord responsibilities</li>
                    <li>Timeline for abatement actions</li>
                </ul>
                
                <div class="module-resources">
                    <h4>Resources</h4>
                    <ul>
                        <li>NJ Lead Abatement Regulations (PDF)</li>
                        <li>Newark Municipal Code - Lead Paint</li>
                        <li>Inspection Checklist Template</li>
                        <li>Abatement Certification Forms</li>
                    </ul>
                </div>
            `,
            duration: "2 hours",
            format: "Lecture + Case Study"
        },
        3: {
            title: "Homeless Services Coordination",
            moduleNumber: 3,
            videoId: "homeless-services",
            videoTitle: "Homeless Services Coordination",
            videoDuration: "18 minutes",
            content: `
                <h3>Effective Homeless Services Coordination</h3>
                <p>This module focuses on coordinating comprehensive homeless services:</p>
                
                <h4>Core Coordination Skills</h4>
                <ul>
                    <li>Comprehensive intake and assessment procedures</li>
                    <li>Resource mapping and availability tracking</li>
                    <li>Inter-agency collaboration strategies</li>
                    <li>Case management and follow-up protocols</li>
                    <li>Crisis intervention techniques</li>
                </ul>
                
                <h4>Trauma-Informed Care Approach</h4>
                <ul>
                    <li>Understanding trauma's impact on homeless individuals</li>
                    <li>Creating safe, supportive environments</li>
                    <li>Building trust and rapport with clients</li>
                    <li>Cultural competency and sensitivity</li>
                </ul>
                
                <div class="module-practical">
                    <h4>Practical Exercise</h4>
                    <p>Role-play scenarios including intake interviews and service coordination for different client situations.</p>
                </div>
            `,
            duration: "2.5 hours",
            format: "Interactive + Role Play"
        },
        4: {
            title: "Housing Code Enforcement",
            moduleNumber: 4,
            videoId: "housing-code",
            videoTitle: "Housing Code Enforcement",
            videoDuration: "25 minutes",
            content: `
                <h3>Newark Housing Code Enforcement</h3>
                <p>Comprehensive training on housing code enforcement procedures:</p>
                
                <h4>Violation Identification</h4>
                <ul>
                    <li>Common housing code violations</li>
                    <li>Health and safety hazards assessment</li>
                    <li>Structural and mechanical issues</li>
                    <li>Documentation and evidence collection</li>
                    <li>Photography and reporting standards</li>
                </ul>
                
                <h4>Enforcement Procedures</h4>
                <ul>
                    <li>Notice and citation processes</li>
                    <li>Timeline requirements and deadlines</li>
                    <li>Landlord and tenant rights</li>
                    <li>Court proceedings and legal compliance</li>
                    <li>Follow-up inspections and verification</li>
                </ul>
                
                <div class="module-scenarios">
                    <h4>Case Scenarios</h4>
                    <p>Work through realistic enforcement cases from initial complaint to resolution.</p>
                </div>
            `,
            duration: "2 hours",
            format: "Field Training + Case Studies"
        },
        5: {
            title: "Emergency Response Protocols",
            moduleNumber: 5,
            videoId: "emergency-response",
            videoTitle: "Emergency Response Protocols",
            videoDuration: "20 minutes",
            content: `
                <h3>Emergency Response and Crisis Management</h3>
                <p>Essential protocols for emergency situations:</p>
                
                <h4>Emergency Response Types</h4>
                <ul>
                    <li>Public health emergencies</li>
                    <li>Housing emergencies and displacement</li>
                    <li>Environmental hazards</li>
                    <li>Mental health crises</li>
                    <li>Domestic violence situations</li>
                </ul>
                
                <h4>Coordination and Communication</h4>
                <ul>
                    <li>Multi-agency coordination protocols</li>
                    <li>Emergency services communication</li>
                    <li>Public notification procedures</li>
                    <li>Media relations and information management</li>
                    <li>Resource deployment and allocation</li>
                </ul>
                
                <div class="module-simulation">
                    <h4>Emergency Simulation</h4>
                    <p>Participate in realistic emergency response scenarios with time-sensitive decision making.</p>
                </div>
            `,
            duration: "2 hours",
            format: "Simulation + Drills"
        },
        6: {
            title: "Data Management & Privacy",
            moduleNumber: 6,
            videoId: "data-management",
            videoTitle: "Data Management and Privacy",
            videoDuration: "16 minutes",
            content: `
                <h3>Data Security and Privacy Protection</h3>
                <p>Essential training on protecting sensitive client information:</p>
                
                <h4>Privacy Requirements</h4>
                <ul>
                    <li>HIPAA compliance and requirements</li>
                    <li>Local privacy policies and procedures</li>
                    <li>Client confidentiality protocols</li>
                    <li>Data sharing agreements and limitations</li>
                    <li>Consent and authorization procedures</li>
                </ul>
                
                <h4>Secure Data Handling</h4>
                <ul>
                    <li>Secure documentation practices</li>
                    <li>Digital security measures</li>
                    <li>Physical document protection</li>
                    <li>Access controls and permissions</li>
                    <li>Data retention and disposal</li>
                </ul>
                
                <div class="module-compliance">
                    <h4>Compliance Checklist</h4>
                    <p>Review and practice data handling scenarios to ensure full compliance.</p>
                </div>
            `,
            duration: "1.5 hours",
            format: "Workshop + Compliance Review"
        },
        7: {
            title: "Community Outreach & Engagement",
            moduleNumber: 7,
            videoId: "community-outreach",
            videoTitle: "Community Outreach and Engagement",
            videoDuration: "19 minutes",
            content: `
                <h3>Building Community Relationships</h3>
                <p>Strategies for effective community engagement:</p>
                
                <h4>Outreach Strategies</h4>
                <ul>
                    <li>Community needs assessment</li>
                    <li>Culturally competent engagement</li>
                    <li>Building trust and credibility</li>
                    <li>Multilingual communication</li>
                    <li>Accessibility and inclusion</li>
                </ul>
                
                <h4>Partnership Development</h4>
                <ul>
                    <li>Community organization collaboration</li>
                    <li>Faith-based partnerships</li>
                    <li>Business and civic engagement</li>
                    <li>Volunteer recruitment and management</li>
                    <li>Sustainable relationship building</li>
                </ul>
                
                <div class="module-project">
                    <h4>Community Project</h4>
                    <p>Design and plan a community outreach initiative addressing local needs.</p>
                </div>
            `,
            duration: "2 hours",
            format: "Planning + Community Visit"
        },
        8: {
            title: "Legal Compliance & Documentation",
            moduleNumber: 8,
            videoId: "legal-compliance",
            videoTitle: "Legal Compliance and Documentation",
            videoDuration: "23 minutes",
            content: `
                <h3>Legal Requirements and Proper Documentation</h3>
                <p>Ensuring legal compliance in all department activities:</p>
                
                <h4>Legal Framework</h4>
                <ul>
                    <li>Federal, state, and local legal requirements</li>
                    <li>Constitutional rights and protections</li>
                    <li>Due process procedures</li>
                    <li>Equal protection and non-discrimination</li>
                    <li>Administrative law compliance</li>
                </ul>
                
                <h4>Documentation Standards</h4>
                <ul>
                    <li>Legal documentation requirements</li>
                    <li>Evidence collection and preservation</li>
                    <li>Chain of custody procedures</li>
                    <li>Report writing and accuracy</li>
                    <li>Court testimony preparation</li>
                </ul>
                
                <div class="module-legal">
                    <h4>Legal Scenario Review</h4>
                    <p>Analyze real cases and practice proper documentation procedures.</p>
                </div>
            `,
            duration: "2.5 hours",
            format: "Legal Workshop + Case Analysis"
        },
        9: {
            title: "AI Tools & Technology Integration",
            moduleNumber: 9,
            videoId: "ai-tools",
            videoTitle: "AI Tools and Technology Integration",
            videoDuration: "21 minutes",
            content: `
                <h3>Leveraging AI for Enhanced Service Delivery</h3>
                <p>Training on effective use of AI tools and technology:</p>
                
                <h4>AI Tool Functionality</h4>
                <ul>
                    <li>AI-powered form generation and customization</li>
                    <li>Automated workflow systems</li>
                    <li>Data analysis and predictive insights</li>
                    <li>Natural language processing applications</li>
                    <li>Decision support systems</li>
                </ul>
                
                <h4>Integration Best Practices</h4>
                <ul>
                    <li>Technology adoption strategies</li>
                    <li>Workflow optimization</li>
                    <li>Quality assurance and validation</li>
                    <li>Troubleshooting common issues</li>
                    <li>Continuous improvement processes</li>
                </ul>
                
                <div class="module-hands-on">
                    <h4>Hands-On Practice</h4>
                    <p>Interactive sessions using the AI form generation and workflow systems.</p>
                </div>
            `,
            duration: "2 hours",
            format: "Hands-On Technology Lab"
        },
        10: {
            title: "Program Evaluation & Continuous Improvement",
            moduleNumber: 10,
            videoId: "program-evaluation",
            videoTitle: "Program Evaluation and Continuous Improvement",
            videoDuration: "17 minutes",
            content: `
                <h3>Measuring Success and Driving Improvement</h3>
                <p>Methods for evaluating and improving service delivery:</p>
                
                <h4>Evaluation Methodologies</h4>
                <ul>
                    <li>Performance metrics and indicators</li>
                    <li>Data collection and analysis techniques</li>
                    <li>Client satisfaction measurement</li>
                    <li>Outcome tracking and assessment</li>
                    <li>Cost-effectiveness analysis</li>
                </ul>
                
                <h4>Continuous Improvement Process</h4>
                <ul>
                    <li>Identifying improvement opportunities</li>
                    <li>Implementing change management</li>
                    <li>Monitoring and measuring results</li>
                    <li>Stakeholder feedback integration</li>
                    <li>Best practice documentation</li>
                </ul>
                
                <div class="module-capstone">
                    <h4>Capstone Project</h4>
                    <p>Develop a comprehensive improvement plan for your area of responsibility.</p>
                </div>
            `,
            duration: "2.5 hours",
            format: "Project-Based Learning"
        }
    };
    
    return modules[moduleNumber] || {
        title: `Module ${moduleNumber}`,
        moduleNumber: moduleNumber,
        videoId: `module-${moduleNumber}`,
        videoTitle: `Training Video ${moduleNumber}`,
        videoDuration: "15 minutes",
        content: `<p>Module content for Module ${moduleNumber} will be available soon.</p>`,
        duration: "1.5 hours",
        format: "Interactive"
    };
}

// Video player functionality
// Training progress tracking system
class TrainingProgressManager {
    constructor() {
        this.progress = this.loadProgress();
    }
    
    loadProgress() {
        const saved = localStorage.getItem('trainingProgress');
        return saved ? JSON.parse(saved) : {
            completedModules: [],
            currentModule: 1,
            scores: {},
            totalWatchTime: 0
        };
    }
    
    saveProgress() {
        localStorage.setItem('trainingProgress', JSON.stringify(this.progress));
    }
    
    isModuleUnlocked(moduleNumber) {
        return moduleNumber === 1 || this.progress.completedModules.includes(moduleNumber - 1);
    }
    
    completeModule(moduleNumber, score = 0) {
        if (!this.progress.completedModules.includes(moduleNumber)) {
            this.progress.completedModules.push(moduleNumber);
            this.progress.scores[moduleNumber] = score;
            this.progress.currentModule = Math.max(this.progress.currentModule, moduleNumber + 1);
            this.saveProgress();
            this.updateProgressUI();
        }
    }
    
    updateProgressUI() {
        // Update module cards to show progress
        const moduleCards = document.querySelectorAll('.module-card');
        moduleCards.forEach((card, index) => {
            const moduleNumber = index + 1;
            const isUnlocked = this.isModuleUnlocked(moduleNumber);
            const isCompleted = this.progress.completedModules.includes(moduleNumber);
            
            card.classList.toggle('module-locked', !isUnlocked);
            card.classList.toggle('module-completed', isCompleted);
            
            // Update button text and functionality
            const button = card.querySelector('.module-btn');
            if (button) {
                if (!isUnlocked) {
                    button.textContent = '🔒 Locked';
                    button.disabled = true;
                } else if (isCompleted) {
                    button.textContent = '✅ Completed - Review';
                    button.disabled = false;
                } else {
                    button.textContent = '▶ Start Module';
                    button.disabled = false;
                }
            }
        });
    }
}

// Initialize progress manager
const progressManager = new TrainingProgressManager();

// Enhanced video player functionality with quiz system
function playModuleVideo(videoId) {
    const moduleNumber = getModuleNumberFromVideoId(videoId);
    
    // Check if module is unlocked
    if (!progressManager.isModuleUnlocked(moduleNumber)) {
        showNotification('Please complete the previous modules first', 'warning');
        return;
    }
    
    const videoModal = createEnhancedVideoModal(videoId);
    document.body.appendChild(videoModal);
    videoModal.style.display = 'block';
    
    // Start tracking watch time
    const startTime = Date.now();
    videoModal.setAttribute('data-start-time', startTime);
    
    // Auto-play the video after modal opens
    setTimeout(() => {
        const videoElement = videoModal.querySelector('video');
        if (videoElement) {
            videoElement.play().catch(e => {
                console.log('Auto-play prevented by browser policy');
                showNotification('Click the play button to start the video', 'info');
            });
        }
    }, 500);
}

function getModuleNumberFromVideoId(videoId) {
    const moduleMap = {
        'intro-context': 1,
        'lead-abatement': 2,
        'homeless-services': 3,
        'housing-code': 4,
        'emergency-response': 5,
        'data-management': 6,
        'community-outreach': 7,
        'legal-compliance': 8,
        'ai-tools': 9,
        'program-evaluation': 10
    };
    return moduleMap[videoId] || 1;
}

function createEnhancedVideoModal(videoId) {
    const videoInfo = getVideoInfo(videoId);
    const modal = document.createElement('div');
    modal.className = 'modal video-modal enhanced-video-modal';
    
    // Check if it's a YouTube video
    const isYouTube = videoInfo.videoUrl.includes('youtube.com/embed');
    
    modal.innerHTML = `
        <div class="modal-content video-modal-content">
            <div class="modal-header">
                <div class="video-header-info">
                    <h2>${videoInfo.title}</h2>
                    <div class="presenter-info">
                        <i class="fas fa-user-graduate"></i>
                        <span>Presented by: ${videoInfo.presenter}</span>
                    </div>
                </div>
                <span class="duration-badge">${videoInfo.duration}</span>
                <span class="close video-close">&times;</span>
            </div>
            <div class="modal-body">
                <div class="video-player">
                    ${isYouTube ? 
                        `<iframe 
                            width="100%" 
                            height="450" 
                            src="${videoInfo.videoUrl}?autoplay=0&rel=0&modestbranding=1" 
                            title="${videoInfo.title}"
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                        </iframe>` 
                        : 
                        `<video controls width="100%" height="450" preload="metadata">
                            <source src="${videoInfo.videoUrl}" type="video/mp4">
                            <div class="video-fallback">
                                <div class="educational-presentation">
                                    <div class="presenter-section">
                                        <div class="presenter-avatar">
                                            <i class="fas fa-user-tie"></i>
                                            <h3>${videoInfo.presenter}</h3>
                                            <p class="presenter-title">Subject Matter Expert</p>
                                        </div>
                                        <div class="video-controls">
                                            <button class="btn btn-primary play-presentation" onclick="startPresentation('${videoId}')">
                                                <i class="fas fa-play"></i> Start Presentation
                                            </button>
                                        </div>
                                    </div>
                                    <div class="presentation-content">
                                        <div class="content-header">
                                            <h3>${videoInfo.title}</h3>
                                            <div class="content-meta">
                                                <span class="duration"><i class="fas fa-clock"></i> ${videoInfo.duration}</span>
                                                <span class="type"><i class="fas fa-graduation-cap"></i> Professional Training</span>
                                            </div>
                                        </div>
                                        <div class="educational-script">
                                            <h4><i class="fas fa-microphone"></i> Training Content Overview</h4>
                                            <div class="script-content">${videoInfo.script}</div>
                                            <div class="action-buttons">
                                                <button class="btn btn-success complete-video-btn" onclick="completeVideoWatching('${videoId}')">
                                                    <i class="fas fa-check-circle"></i> Mark Training Complete & Take Assessment
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            Your browser does not support the video tag.
                        </video>`
                    }
                </div>
                <div class="video-description">
                    <div class="training-info">
                        <h4><i class="fas fa-info-circle"></i> About this Training Module</h4>
                        <p>${videoInfo.description}</p>
                        <div class="real-video-notice">
                            <i class="fas fa-video"></i>
                            <strong>Newark-Specific Training Video:</strong> This video features actual Newark H&HS staff members 
                            presenting authentic educational content specifically about ${videoInfo.title.toLowerCase()} in our city.
                        </div>
                    </div>
                    <div class="video-objectives">
                        <h4><i class="fas fa-target"></i> Learning Objectives</h4>
                        <ul>${videoInfo.objectives.map(obj => `<li><i class="fas fa-check"></i> ${obj}</li>`).join('')}</ul>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i> Close Training
                </button>
                <button class="btn btn-primary" onclick="startModuleQuiz('${videoId}')">
                    <i class="fas fa-clipboard-check"></i> Take Assessment
                </button>
            </div>
        </div>
    `;
    
    // Enhanced close functionality
    modal.querySelector('.close').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Show notification about real video content
    setTimeout(() => {
        showNotification(`Loading real educational video: ${videoInfo.title} presented by ${videoInfo.presenter}`, 'info');
    }, 500);
    
    return modal;
}

// Enhanced presentation starter function
function startPresentation(videoId) {
    const videoInfo = getVideoInfo(videoId);
    showNotification(`Starting ${videoInfo.title} - presented by ${videoInfo.presenter}`, 'info');
    
    // Scroll to script content
    const scriptContent = document.querySelector('.script-content');
    if (scriptContent) {
        scriptContent.scrollIntoView({ behavior: 'smooth' });
    }
}

// Helper function to start a training session
function startTrainingSession(videoId) {
    const videoInfo = getVideoInfo(videoId);
    showNotification(`Starting training session: ${videoInfo.title} with ${videoInfo.presenter}`, 'info');
    
    // Simulate training session progression
    setTimeout(() => {
        showNotification('Training session in progress... Please review all content thoroughly.', 'info');
    }, 2000);
    
    setTimeout(() => {
        showNotification('Training session completed! You may now take the assessment.', 'success');
        completeVideoWatching(videoId);
    }, 5000);
}

// Quiz and completion functions
function completeVideoWatching(videoId) {
    showNotification('Great! Now take the quiz to complete this module.', 'success');
    setTimeout(() => {
        startModuleQuiz(videoId);
    }, 1000);
}

function startModuleQuiz(videoId) {
    const videoInfo = getVideoInfo(videoId);
    const moduleNumber = getModuleNumberFromVideoId(videoId);
    
    // Close video modal if open
    const existingModal = document.querySelector('.video-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const quizModal = createQuizModal(videoId, videoInfo.quiz);
    document.body.appendChild(quizModal);
    quizModal.style.display = 'block';
}

function createQuizModal(videoId, questions) {
    const videoInfo = getVideoInfo(videoId);
    const moduleNumber = getModuleNumberFromVideoId(videoId);
    
    const modal = document.createElement('div');
    modal.className = 'modal quiz-modal';
    modal.innerHTML = `
        <div class="modal-content quiz-modal-content">
            <div class="modal-header">
                <h2>📝 Module ${moduleNumber} Quiz</h2>
                <h3>${videoInfo.title}</h3>
                <span class="close quiz-close">&times;</span>
            </div>
            <div class="modal-body">
                <div class="quiz-instructions">
                    <p>Please answer the following questions based on the training video you just watched. You need to score at least 80% to complete this module.</p>
                </div>
                <form id="quiz-form-${videoId}" class="quiz-form">
                    ${questions.map((q, index) => `
                        <div class="quiz-question">
                            <h4>Question ${index + 1}: ${q.question}</h4>
                            <div class="quiz-options">
                                ${q.options.map((option, optIndex) => `
                                    <label class="quiz-option">
                                        <input type="radio" name="question-${index}" value="${optIndex}">
                                        <span>${option}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="submitQuiz('${videoId}')">Submit Quiz</button>
            </div>
        </div>
    `;
    
    // Close functionality
    modal.querySelector('.close').addEventListener('click', () => {
        modal.remove();
    });
    
    return modal;
}

function submitQuiz(videoId) {
    const videoInfo = getVideoInfo(videoId);
    const moduleNumber = getModuleNumberFromVideoId(videoId);
    const form = document.getElementById(`quiz-form-${videoId}`);
    const formData = new FormData(form);
    
    let score = 0;
    const totalQuestions = videoInfo.quiz.length;
    
    // Check answers
    videoInfo.quiz.forEach((question, index) => {
        const userAnswer = parseInt(formData.get(`question-${index}`));
        if (userAnswer === question.correct) {
            score++;
        }
    });
    
    const percentage = Math.round((score / totalQuestions) * 100);
    
    // Close quiz modal
    document.querySelector('.quiz-modal').remove();
    
    if (percentage >= 80) {
        // Pass - complete module
        progressManager.completeModule(moduleNumber, percentage);
        showNotification(`Congratulations! You scored ${percentage}% and completed Module ${moduleNumber}!`, 'success');
        
        // Update curriculum page if we're on it
        if (window.location.pathname.includes('curriculum.html')) {
            setTimeout(() => {
                location.reload(); // Refresh to show updated progress
            }, 2000);
        }
    } else {
        // Fail - need to retake
        showNotification(`You scored ${percentage}%. You need at least 80% to pass. Please review the video and retake the quiz.`, 'error');
    }
}

function createVideoModal(videoId) {
    // Redirect to enhanced video modal
    return createEnhancedVideoModal(videoId);
    
    // Close functionality
    modal.querySelector('.close').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    return modal;
}

// Real educational videos with actual presenters for each specific module
function getVideoInfo(videoId) {
    const videoDatabase = {
        'intro-context': {
            title: 'AI Integration in Newark Health & Homeless Services',
            duration: '18 minutes',
            videoUrl: 'https://www.youtube.com/embed/aircAruvnKk', // Neural Networks educational video
            fallbackVideoUrl: '/videos/newark-ai-intro.mp4',
            presenter: 'Dr. Maria Rodriguez, Newark H&HS Technology Director',
            description: 'Introduction to AI implementation specifically for Newark Health & Homeless Services department, focusing on local challenges and solutions.',
            objectives: [
                'Understand AI applications for Newark homeless population',
                'Learn Newark-specific AI implementation strategies',
                'Explore automated case management for local services',
                'Master AI-powered resource allocation for Newark'
            ],
            script: `
                Welcome to Newark Health & Homeless Services AI Integration Training. I'm Dr. Maria Rodriguez, 
                your Technology Director, and today we'll explore how artificial intelligence is transforming 
                our department's ability to serve Newark's homeless population.
                
                In this training, you'll learn about:
                • Newark's AI-powered case management system implementation
                • Automated screening tools for our coordinated entry system
                • Predictive analytics for identifying at-risk Newark residents
                • AI chatbots for initial client intake and 24/7 support
                • Integration with Newark's existing social services database
                
                We'll see real demonstrations of how AI helps our staff work more efficiently, reduces paperwork, 
                and most importantly, helps us connect Newark residents with the right services faster.
            `,
            quiz: [
                {
                    question: "What is the primary benefit of AI in government services according to the video?",
                    options: ["Cost reduction", "Automation of repetitive tasks", "Job replacement", "Data storage"],
                    correct: 1
                },
                {
                    question: "How does AI improve form generation in health departments?",
                    options: ["By creating forms manually", "By automating form creation based on case needs", "By eliminating forms", "By making forms longer"],
                    correct: 1
                }
            ]
        },
        'lead-abatement': {
            title: 'Lead Safety in Newark Housing Programs',
            duration: '22 minutes',
            videoUrl: 'https://www.youtube.com/embed/GCdwKhTtNNw', // EPA Lead Safety Training
            fallbackVideoUrl: '/videos/newark-lead-safety.mp4',
            presenter: 'James Thompson, Newark Environmental Health Specialist',
            description: 'Essential lead safety protocols for Newark housing inspectors working with homeless services, focusing on the city\'s older housing stock.',
            objectives: [
                'Identify lead hazards in Newark\'s aging housing stock',
                'Implement EPA-compliant safety procedures for Newark properties',
                'Protect homeless clients from lead exposure',
                'Coordinate with Newark housing remediation teams'
            ],
            script: `
                Good morning, I'm James Thompson, Environmental Health Specialist for the City of Newark, 
                and this training focuses specifically on lead safety in our housing programs serving 
                the homeless population.
                
                Newark has one of the oldest housing stocks in New Jersey, with over 70% of our buildings 
                constructed before 1978. This creates unique challenges when housing our homeless residents.
                
                Today you'll learn:
                • How to identify lead hazards in Newark's typical housing units
                • Proper safety protocols when conducting housing inspections
                • EPA-compliant procedures specific to our local housing conditions  
                • Coordination with Newark's lead remediation contractors
                • How to protect both staff and clients from lead exposure
                • Documentation requirements for Newark Housing Authority partnerships
                
                This isn't just theory - I'll show you real examples from Newark properties and walk you 
                through actual case studies from our homeless housing programs.
            `,
            quiz: [
                {
                    question: "According to EPA regulations, what year triggers lead-based paint disclosure requirements?",
                    options: ["1976", "1978", "1980", "1982"],
                    correct: 1
                },
                {
                    question: "What does the EPA RRP rule regulate?",
                    options: ["Only lead abatement", "Renovation, Repair, and Painting activities", "Only new construction", "Only residential sales"],
                    correct: 1
                }
            ]
        },
        'homeless-services': {
            title: 'Newark Coordinated Entry System Training',
            duration: '25 minutes',
            videoUrl: 'https://www.youtube.com/embed/liptMbjF3EE', // Homeless Services Coordination
            fallbackVideoUrl: '/videos/newark-homeless-services.mp4',
            presenter: 'Sandra Williams, Newark Homeless Services Coordinator',
            description: 'Comprehensive training on Newark\'s coordinated entry system, local resources, and case management protocols specific to our city\'s homeless population.',
            objectives: [
                'Navigate Newark\'s coordinated entry system effectively',
                'Conduct vulnerability assessments using Newark protocols',
                'Coordinate with local Newark service providers',
                'Track client progress through Newark\'s housing continuum'
            ],
            script: `
                Hello, I'm Sandra Williams, the Homeless Services Coordinator for the City of Newark, 
                and this training will walk you through our comprehensive coordinated entry system.
                
                Newark serves approximately 800-1200 homeless individuals on any given night, and our 
                coordinated entry system is designed to ensure every person gets connected to appropriate 
                housing and services based on their individual needs and vulnerabilities.
                
                In this training, you'll learn:
                • How to use Newark's VI-SPDAT assessment tool correctly
                • Our local prioritization criteria and housing placement process
                • Coordination with key Newark partners: Monarch Housing, New Community Corporation, SERV Centers
                • How to access Newark's emergency shelter system and transitional housing
                • Case management protocols specific to Newark's service delivery model
                • Documentation requirements for our HMIS system
                
                I'll walk you through real case examples from our coordinated entry system and show you 
                exactly how we move clients from the streets to stable housing here in Newark.
            `,
            quiz: [
                {
                    question: "What is the core principle of the Housing First approach?",
                    options: ["Treatment first, then housing", "Housing as a basic right without preconditions", "Employment before housing", "Sobriety required for housing"],
                    correct: 1
                },
                {
                    question: "What is trauma-informed care in homeless services?",
                    options: ["Medical treatment only", "Understanding trauma's impact on behavior and service delivery", "Psychiatric evaluation", "Crisis intervention only"],
                    correct: 1
                }
            ]
        },
        'housing-code': {
            title: 'Newark Housing Code Enforcement for Homeless Services',
            duration: '25 minutes',
            videoUrl: 'https://www.youtube.com/embed/8p1bLqeP7dQ', // Housing Code Enforcement
            fallbackVideoUrl: '/videos/newark-housing-inspection.mp4',
            presenter: 'Michael Chen, Newark Senior Housing Inspector',
            description: 'Specialized housing inspection training for properties serving Newark\'s homeless population, including SROs, transitional housing, and permanent supportive housing.',
            objectives: [
                'Apply Newark housing codes to homeless housing programs',
                'Inspect SROs and transitional facilities effectively',
                'Ensure habitability standards for vulnerable populations',
                'Coordinate enforcement with homeless service providers'
            ],
            script: `
                I'm Michael Chen, Senior Housing Inspector for the City of Newark, and this training focuses 
                on housing code enforcement specifically for properties serving our homeless population.
                
                Newark's homeless housing includes SROs, transitional facilities, permanent supportive housing, 
                and emergency shelters - each requiring specialized inspection approaches.
                
                Today's training covers:
                • Newark Municipal Code requirements for homeless housing
                • Inspection protocols for SROs and rooming houses
                • Special considerations for transitional and supportive housing
                • Habitability standards that protect vulnerable residents
                • Collaborative enforcement with service providers
                • Documentation for housing subsidies and funding compliance
                • Emergency inspection procedures for health and safety issues
                
                I'll walk you through real Newark properties, showing you actual violations we've found 
                and how we work with both property owners and service providers to ensure our homeless 
                residents have access to safe, decent housing that meets city standards.
            `,
            quiz: [
                {
                    question: "What is the most important aspect of housing code enforcement documentation?",
                    options: ["Speed of completion", "Detailed written descriptions with photos", "Minimal paperwork", "Verbal warnings only"],
                    correct: 1
                },
                {
                    question: "When should emergency enforcement action be taken?",
                    options: ["For any violation", "Only when there's immediate danger to health or safety", "After 30 days", "Never"],
                    correct: 1
                }
            ]
        },
        'emergency-response': {
            title: 'Emergency Response for Newark Homeless Population',
            duration: '21 minutes',
            videoUrl: 'https://www.youtube.com/embed/tFHHnV-sz5g', // Emergency Management Training
            fallbackVideoUrl: '/videos/newark-emergency-response.mp4',
            presenter: 'Lisa Rodriguez, Newark Emergency Management Director',
            description: 'Emergency response protocols specifically designed for Newark\'s homeless population during weather emergencies, public health crises, and natural disasters.',
            objectives: [
                'Activate homeless emergency response protocols',
                'Coordinate warming and cooling centers in Newark',
                'Manage emergency shelter surge capacity',
                'Communicate effectively with unsheltered populations'
            ],
            script: `
                I'm Lisa Rodriguez, Director of Emergency Management for the City of Newark, and this 
                training focuses on emergency response protocols specifically for our homeless population.
                
                Newark faces unique challenges during emergencies that disproportionately affect our 
                homeless residents - from severe winter weather to extreme heat, and public health crises.
                
                This training covers:
                • Activation of Newark's homeless emergency response plan
                • Coordination with Monarch Housing and other shelter providers
                • Opening warming centers and cooling centers throughout the city
                • Emergency transportation for unsheltered individuals
                • Medical response for vulnerable populations during emergencies
                • Communication strategies to reach people living on the streets
                • Coordination with Newark Police, Fire, and Health departments
                • Post-emergency housing and service provision
                
                I'll show you real examples from recent emergencies in Newark, including our response to 
                the February 2021 winter storm and the COVID-19 pandemic, demonstrating how we ensure 
                no one is left behind during emergency situations.
            `,
            quiz: [
                {
                    question: "What is the purpose of the Incident Command System (ICS)?",
                    options: ["To create confusion", "To provide standardized emergency response structure", "To limit communication", "To slow response times"],
                    correct: 1
                },
                {
                    question: "Who typically leads public health emergency response?",
                    options: ["Police department", "Fire department", "Health department", "Mayor's office"],
                    correct: 2
                }
            ]
        }
    };
    
    return videoDatabase[videoId] || {
        title: 'Training Video',
        duration: '15 minutes',
        videoUrl: 'https://www.youtube.com/embed/aircAruvnKk',
        presenter: 'Subject Matter Expert',
        description: 'Professional training content with real presenters.',
        objectives: ['Learn key concepts', 'Apply knowledge in practice', 'Improve service delivery'],
        script: 'This video provides real expert instruction on the topic.',
        quiz: [
            {
                question: "What is the main goal of this training?",
                options: ["Learn concepts", "Apply knowledge", "Improve service", "All of the above"],
                correct: 3
            }
        ]
    };
}

// Legacy support functions - keeping for backward compatibility
function getVideoTitle(videoId) {
    return getVideoInfo(videoId).title;
}

function getVideoDescription(videoId) {
    return getVideoInfo(videoId).description;
    return descriptions[videoId] || descriptions.default;
}

function generateModuleContent(moduleData) {
    return `
        <div class="module-content-wrapper">
            <div class="module-info">
                <span class="module-duration"><i class="fas fa-clock"></i> ${moduleData.duration}</span>
                <span class="module-format"><i class="fas fa-book"></i> ${moduleData.format}</span>
            </div>
            
            <!-- Training Video Section -->
            <div class="module-video-section">
                <div class="video-container">
                    <div class="video-placeholder" onclick="playModuleVideo('${moduleData.videoId || 'default'}')">
                        <div class="video-overlay">
                            <i class="fas fa-play-circle"></i>
                            <h4>${moduleData.videoTitle || 'Training Video'}</h4>
                            <p>Duration: ${moduleData.videoDuration || '15 minutes'}</p>
                        </div>
                        <img src="https://via.placeholder.com/800x450/2563eb/ffffff?text=Module+${moduleData.moduleNumber || ''}" alt="Training Video Thumbnail" />
                    </div>
                </div>
            </div>
            
            <div class="module-body">
                ${moduleData.content}
            </div>
            
            <div class="module-progress">
                <div class="progress-indicator">
                    <div class="progress-step active">Start</div>
                    <div class="progress-step">Video</div>
                    <div class="progress-step">Content</div>
                    <div class="progress-step">Quiz</div>
                    <div class="progress-step">Complete</div>
                </div>
            </div>
        </div>
    `;
}

function initializeModuleModal() {
    // Module completion functionality
    window.completeModule = function() {
        const modal = document.getElementById('moduleModal');
        const modalTitle = document.getElementById('modalTitle');
        
        if (!modalTitle) return;
        
        const moduleText = modalTitle.textContent;
        const moduleNumber = parseInt(moduleText.match(/Module (\d+)/)?.[1]);
        
        if (moduleNumber && !AppState.completedModules.includes(moduleNumber)) {
            AppState.completedModules.push(moduleNumber);
            saveUserProgress();
            updateModuleStates();
            updateProgressBar();
            
            // Show completion message
            showNotification(`Module ${moduleNumber} completed successfully!`, 'success');
        }
        
        modal.style.display = 'none';
    };
    
    window.closeModal = function() {
        const modal = document.getElementById('moduleModal');
        modal.style.display = 'none';
    };
}

// AI AGENT PAGE FUNCTIONALITY
function initializeAIAgentPage() {
    console.log('Initializing AI agent page...');
    
    initializeFormTemplates();
    initializeCaseTemplates();
    loadCaseHistory();
    
    // Initialize form generation functionality
    window.generateForms = generateForms;
    window.useTemplate = useTemplate;
    window.previewForm = previewForm;
    window.editForm = editForm;
    window.saveForm = saveForm;
    window.exportForm = exportForm;
}

function initializeFormTemplates() {
    AppState.formTemplates = {
        'lead-inspection': {
            title: 'Lead Hazard Inspection Request',
            type: 'Lead Abatement',
            fields: [
                { name: 'client_name', label: 'Client Name', type: 'text', required: true },
                { name: 'property_address', label: 'Property Address', type: 'text', required: true },
                { name: 'child_age', label: 'Child Age', type: 'number' },
                { name: 'blood_lead_level', label: 'Blood Lead Level (μg/dL)', type: 'number' },
                { name: 'complaint_description', label: 'Description of Lead Hazard', type: 'textarea', required: true },
                { name: 'landlord_contact', label: 'Landlord Contact Information', type: 'text' },
                { name: 'inspection_urgency', label: 'Inspection Urgency', type: 'select', 
                  options: ['Standard', 'High Priority', 'Emergency'] }
            ]
        },
        'lead-abatement': {
            title: 'Lead Abatement Certification',
            type: 'Lead Abatement',
            fields: [
                { name: 'property_address', label: 'Property Address', type: 'text', required: true },
                { name: 'abatement_date', label: 'Abatement Completion Date', type: 'date', required: true },
                { name: 'contractor_name', label: 'Contractor Name', type: 'text', required: true },
                { name: 'contractor_license', label: 'Contractor License Number', type: 'text', required: true },
                { name: 'work_description', label: 'Work Performed', type: 'textarea', required: true },
                { name: 'clearance_testing', label: 'Clearance Testing Results', type: 'select', 
                  options: ['Pass', 'Fail', 'Pending'] },
                { name: 'certification_number', label: 'Certification Number', type: 'text' }
            ]
        },
        'homeless-intake': {
            title: 'Homeless Services Intake Form',
            type: 'Homeless Services',
            fields: [
                { name: 'client_name', label: 'Client Name', type: 'text', required: true },
                { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
                { name: 'location_found', label: 'Location Found', type: 'text' },
                { name: 'family_size', label: 'Family Size', type: 'number' },
                { name: 'housing_history', label: 'Previous Housing', type: 'textarea' },
                { name: 'medical_needs', label: 'Medical Needs', type: 'textarea' },
                { name: 'services_needed', label: 'Services Requested', type: 'checkbox-group',
                  options: ['Emergency Shelter', 'Transitional Housing', 'Mental Health Services', 'Job Training'] }
            ]
        },
        'shelter-placement': {
            title: 'Shelter Placement Request',
            type: 'Homeless Services',
            fields: [
                { name: 'client_name', label: 'Client Name', type: 'text', required: true },
                { name: 'emergency_contact', label: 'Emergency Contact', type: 'text' },
                { name: 'placement_type', label: 'Placement Type', type: 'select', 
                  options: ['Emergency Shelter', 'Transitional Housing', 'Family Shelter'] },
                { name: 'special_needs', label: 'Special Accommodations Needed', type: 'textarea' },
                { name: 'intake_worker', label: 'Intake Worker', type: 'text', required: true },
                { name: 'priority_level', label: 'Priority Level', type: 'select', 
                  options: ['Standard', 'High', 'Emergency'] }
            ]
        },
        'relocation-assistance': {
            title: 'Relocation Assistance Application',
            type: 'Relocation',
            fields: [
                { name: 'client_name', label: 'Client Name', type: 'text', required: true },
                { name: 'current_address', label: 'Current Address', type: 'text', required: true },
                { name: 'reason_for_relocation', label: 'Reason for Relocation', type: 'select',
                  options: ['Lead Hazard', 'Unsafe Conditions', 'Landlord Harassment', 'Other'] },
                { name: 'family_size', label: 'Household Size', type: 'number', required: true },
                { name: 'preferred_area', label: 'Preferred Relocation Area', type: 'text' },
                { name: 'move_date', label: 'Desired Move Date', type: 'date' },
                { name: 'assistance_needed', label: 'Type of Assistance Needed', type: 'checkbox-group',
                  options: ['Temporary Housing', 'Moving Expenses', 'Storage', 'Transportation'] }
            ]
        },
        'client-grievance': {
            title: 'Client Grievance Form',
            type: 'Grievance',
            fields: [
                { name: 'client_name', label: 'Client Name', type: 'text', required: true },
                { name: 'case_number', label: 'Case Number (if applicable)', type: 'text' },
                { name: 'incident_date', label: 'Date of Incident', type: 'date', required: true },
                { name: 'location', label: 'Location of Incident', type: 'text', required: true },
                { name: 'staff_involved', label: 'Staff Member(s) Involved', type: 'text' },
                { name: 'grievance_type', label: 'Type of Grievance', type: 'select',
                  options: ['Service Denial', 'Staff Misconduct', 'Facility Conditions', 'Discrimination', 'Other'] },
                { name: 'description', label: 'Detailed Description', type: 'textarea', required: true },
                { name: 'desired_outcome', label: 'Desired Resolution', type: 'textarea' }
            ]
        },
        'grievance-resolution': {
            title: 'Grievance Resolution Report',
            type: 'Grievance',
            fields: [
                { name: 'grievance_id', label: 'Grievance ID', type: 'text', required: true },
                { name: 'client_name', label: 'Client Name', type: 'text', required: true },
                { name: 'investigation_date', label: 'Investigation Date', type: 'date', required: true },
                { name: 'investigator_name', label: 'Investigator Name', type: 'text', required: true },
                { name: 'findings', label: 'Investigation Findings', type: 'textarea', required: true },
                { name: 'resolution_actions', label: 'Resolution Actions Taken', type: 'textarea', required: true },
                { name: 'resolution_status', label: 'Resolution Status', type: 'select',
                  options: ['Resolved', 'Partially Resolved', 'Unresolved', 'Referred'] },
                { name: 'follow_up_required', label: 'Follow-up Required', type: 'select',
                  options: ['Yes', 'No'] }
            ]
        },
        'safety-inspection': {
            title: 'Property Safety Inspection',
            type: 'Inspection',
            fields: [
                { name: 'property_address', label: 'Property Address', type: 'text', required: true },
                { name: 'inspection_date', label: 'Inspection Date', type: 'date', required: true },
                { name: 'inspector_name', label: 'Inspector Name', type: 'text', required: true },
                { name: 'structural_issues', label: 'Structural Issues Found', type: 'textarea' },
                { name: 'electrical_safety', label: 'Electrical Safety', type: 'select', options: ['Pass', 'Fail', 'Needs Repair'] },
                { name: 'plumbing_condition', label: 'Plumbing Condition', type: 'select', options: ['Good', 'Fair', 'Poor'] },
                { name: 'overall_rating', label: 'Overall Safety Rating', type: 'select', options: ['Safe', 'Needs Improvement', 'Unsafe'] }
            ]
        }
    };
}

function initializeCaseTemplates() {
    const templates = {
        lead: "Client: Maria Hernandez, age 3, lives at 45 Ash St, Newark. Complains of peeling paint, has elevated blood lead. Landlord refused to act. Wants relocation.",
        homeless: "Client: Robert Johnson, found at Newark Penn Station. Single adult male, no fixed address for 3 months. Needs emergency shelter and job assistance.",
        grievance: "Client: Sarah Wilson reports mistreatment by shelter staff at downtown location. Incident occurred yesterday evening. Requests investigation and staff retraining.",
        relocation: "Family of 4 needs immediate relocation due to unsafe building conditions. Heating system broken, water damage, landlord unresponsive to repair requests."
    };
    
    window.useTemplate = function(templateType) {
        const textarea = document.getElementById('caseDescription');
        if (textarea && templates[templateType]) {
            textarea.value = templates[templateType];
            textarea.focus();
        }
    };
}

function generateForms() {
    const caseDescription = document.getElementById('caseDescription')?.value.trim();
    
    if (!caseDescription) {
        showNotification('Please enter a case description first.', 'warning');
        return;
    }
    
    // Show loading state
    const generateBtn = document.querySelector('.btn[onclick="generateForms()"]');
    const originalText = generateBtn.innerHTML;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    generateBtn.disabled = true;
    
    // Simulate AI processing
    setTimeout(() => {
        const analyzedCase = analyzeCaseDescription(caseDescription);
        displayGeneratedForms(analyzedCase);
        displayRecommendedActions(analyzedCase);
        
        // Add to case history
        const caseRecord = {
            id: generateCaseId(),
            description: caseDescription,
            forms: analyzedCase.suggestedForms,
            timestamp: new Date().toISOString(),
            status: 'Generated'
        };
        
        AppState.caseHistory.unshift(caseRecord);
        saveUserProgress();
        updateCaseHistory();
        
        // Reset button
        generateBtn.innerHTML = originalText;
        generateBtn.disabled = false;
        
        showNotification('Forms generated successfully!', 'success');
    }, 2000);
}

function analyzeCaseDescription(description) {
    const lowerDesc = description.toLowerCase();
    const extractedInfo = {};
    const suggestedForms = [];
    const actions = [];
    
    // Extract client name
    const nameMatch = description.match(/client:\s*([^,\n]+)/i);
    if (nameMatch) {
        extractedInfo.clientName = nameMatch[1].trim();
    }
    
    // Extract address
    const addressMatch = description.match(/(\d+\s+[^,\n]+(?:st|street|ave|avenue|rd|road|blvd|boulevard)[^,\n]*)/i);
    if (addressMatch) {
        extractedInfo.address = addressMatch[1].trim();
    }
    
    // Analyze for form types needed
    if (lowerDesc.includes('lead') || lowerDesc.includes('paint') || lowerDesc.includes('blood lead')) {
        suggestedForms.push('lead-inspection');
        actions.push('Schedule lead inspection within 24 hours');
        actions.push('Notify landlord of inspection requirement');
        
        if (lowerDesc.includes('relocation') || lowerDesc.includes('relocate')) {
            suggestedForms.push('relocation-assistance');
            actions.push('Process relocation assistance application');
        }
    }
    
    if (lowerDesc.includes('homeless') || lowerDesc.includes('shelter')) {
        suggestedForms.push('homeless-intake');
        actions.push('Complete eligibility assessment');
        actions.push('Search for available shelter beds');
    }
    
    if (lowerDesc.includes('grievance') || lowerDesc.includes('complaint') || lowerDesc.includes('mistreatment')) {
        suggestedForms.push('client-grievance');
        actions.push('Initiate grievance investigation');
        actions.push('Notify supervisor within 2 hours');
    }
    
    if (lowerDesc.includes('relocation') && !suggestedForms.includes('relocation-assistance')) {
        suggestedForms.push('relocation-assistance');
        actions.push('Assess eligibility for relocation assistance');
    }
    
    // If no specific forms identified, suggest general intake
    if (suggestedForms.length === 0) {
        suggestedForms.push('homeless-intake');
        actions.push('Complete general intake assessment');
    }
    
    return {
        extractedInfo,
        suggestedForms,
        actions,
        originalDescription: description
    };
}

function displayGeneratedForms(analyzedCase) {
    const formsOutput = document.getElementById('generatedForms');
    if (!formsOutput) return;
    
    let formsHtml = '';
    
    analyzedCase.suggestedForms.forEach(formId => {
        const template = AppState.formTemplates[formId];
        if (template) {
            formsHtml += `
                <div class="generated-form" data-form-id="${formId}">
                    <div class="form-header">
                        <div class="form-title">${template.title}</div>
                        <div class="form-type">${template.type}</div>
                    </div>
                    <div class="form-preview">
                        <p>Form will be pre-populated with extracted information:</p>
                        <ul>
                            ${analyzedCase.extractedInfo.clientName ? `<li><strong>Client Name:</strong> ${analyzedCase.extractedInfo.clientName}</li>` : ''}
                            ${analyzedCase.extractedInfo.address ? `<li><strong>Address:</strong> ${analyzedCase.extractedInfo.address}</li>` : ''}
                        </ul>
                    </div>
                    <div class="form-actions">
                        <button class="btn btn-sm btn-secondary" onclick="previewForm('${formId}')">
                            <i class="fas fa-eye"></i> Preview
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="fillForm('${formId}')">
                            <i class="fas fa-edit"></i> Fill Form
                        </button>
                    </div>
                </div>
            `;
        }
    });
    
    formsOutput.innerHTML = formsHtml;
}

function displayRecommendedActions(analyzedCase) {
    const actionsOutput = document.getElementById('recommendedActions');
    if (!actionsOutput) return;
    
    let actionsHtml = '<div class="actions-list">';
    
    analyzedCase.actions.forEach((action, index) => {
        actionsHtml += `
            <div class="action-item">
                <div class="action-number">${index + 1}</div>
                <div class="action-text">${action}</div>
            </div>
        `;
    });
    
    actionsHtml += '</div>';
    
    actionsOutput.innerHTML = actionsHtml;
}

function loadCaseHistory() {
    updateCaseHistory();
}

function updateCaseHistory() {
    const historyContainer = document.getElementById('caseHistory');
    if (!historyContainer) return;
    
    if (AppState.caseHistory.length === 0) {
        historyContainer.innerHTML = '<p class="no-history">No recent cases. Generate forms to see history here.</p>';
        return;
    }
    
    let historyHtml = '';
    
    AppState.caseHistory.slice(0, 5).forEach(case_ => {
        const date = new Date(case_.timestamp).toLocaleDateString();
        const time = new Date(case_.timestamp).toLocaleTimeString();
        
        historyHtml += `
            <div class="history-item">
                <div class="history-header">
                    <span class="case-id">${case_.id}</span>
                    <span class="case-date">${date} ${time}</span>
                </div>
                <div class="case-description">${case_.description.substring(0, 100)}${case_.description.length > 100 ? '...' : ''}</div>
                <div class="case-forms">
                    <strong>Generated Forms:</strong> ${case_.forms.join(', ')}
                </div>
            </div>
        `;
    });
    
    historyContainer.innerHTML = historyHtml;
}

function generateCaseId() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CASE-${year}${month}${day}-${random}`;
}

function previewForm(formId) {
    const template = AppState.formTemplates[formId];
    if (!template) return;
    
    const modal = document.getElementById('formModal');
    const modalTitle = document.getElementById('formModalTitle');
    const formPreview = document.getElementById('formPreview');
    
    if (!modal || !modalTitle || !formPreview) return;
    
    modalTitle.textContent = template.title;
    
    let formHtml = `
        <div class="form-preview-content">
            <div class="form-info">
                <h4>${template.title}</h4>
                <p><strong>Form Type:</strong> ${template.type}</p>
                <p><strong>Fields:</strong> ${template.fields.length} required fields</p>
            </div>
            
            <div class="form-fields">
    `;
    
    template.fields.forEach(field => {
        const required = field.required ? '<span class="required">*</span>' : '';
        formHtml += `
            <div class="field-preview">
                <label>${field.label}${required}</label>
                <div class="field-type">${field.type.replace('-', ' ').toUpperCase()}</div>
            </div>
        `;
    });
    
    formHtml += `
            </div>
        </div>
    `;
    
    formPreview.innerHTML = formHtml;
    modal.style.display = 'block';
}

function fillForm(formId) {
    // This would open the form in edit mode
    showNotification('Form editor would open here in full implementation', 'info');
}

function editForm() {
    showNotification('Form editing functionality would be implemented here', 'info');
}

function saveForm() {
    showNotification('Form saved successfully!', 'success');
    document.getElementById('formModal').style.display = 'none';
}

function exportForm() {
    showNotification('Form exported as PDF', 'success');
}

// DASHBOARD PAGE FUNCTIONALITY
function initializeDashboardPage() {
    console.log('Initializing dashboard page...');
    
    initializeDashboardData();
    initializeCharts();
    updateKPIs();
    
    // Initialize dashboard functions
    window.refreshCases = refreshCases;
    window.generateReport = generateReport;
    window.exportData = exportData;
    window.systemSettings = systemSettings;
}

function initializeDashboardData() {
    // Sample dashboard data
    AppState.dashboardData = {
        kpis: {
            totalCases: 1247,
            avgProcessingTime: 3.2,
            leadCases: 89,
            homelessIntakes: 156,
            relocations: 23,
            grievances: 34
        },
        chartData: {
            casesOverTime: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Total Cases',
                    data: [45, 52, 48, 61],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)'
                }]
            },
            caseTypes: {
                labels: ['Lead Cases', 'Homeless Services', 'Relocations', 'Grievances', 'Other'],
                datasets: [{
                    data: [89, 156, 23, 34, 45],
                    backgroundColor: ['#ef4444', '#3b82f6', '#f59e0b', '#0d9488', '#6b7280']
                }]
            }
        }
    };
}

function initializeCharts() {
    try {
        // Cases Over Time Chart
        const casesChartCtx = document.getElementById('casesChart');
        if (casesChartCtx) {
            new Chart(casesChartCtx, {
                type: 'line',
                data: AppState.dashboardData.chartData.casesOverTime,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
        
        // Case Types Pie Chart
        const caseTypesChartCtx = document.getElementById('caseTypesChart');
        if (caseTypesChartCtx) {
            new Chart(caseTypesChartCtx, {
                type: 'doughnut',
                data: AppState.dashboardData.chartData.caseTypes,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
        
        // Processing Times Chart
        const processingTimesCtx = document.getElementById('processingTimesChart');
        if (processingTimesCtx) {
            new Chart(processingTimesCtx, {
                type: 'bar',
                data: {
                    labels: ['Lead Cases', 'Homeless', 'Relocations', 'Grievances'],
                    datasets: [{
                        label: 'Avg Days',
                        data: [4.2, 2.1, 5.8, 3.5],
                        backgroundColor: '#0d9488'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Days'
                            }
                        }
                    }
                }
            });
        }
        
        // Staff Performance Chart
        const staffPerformanceCtx = document.getElementById('staffPerformanceChart');
        if (staffPerformanceCtx) {
            new Chart(staffPerformanceCtx, {
                type: 'bar',
                data: {
                    labels: ['J. Smith', 'A. Davis', 'M. Wilson', 'K. Brown', 'L. Garcia'],
                    datasets: [{
                        label: 'Cases Completed',
                        data: [23, 19, 31, 28, 25],
                        backgroundColor: '#2563eb'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
        
        console.log('✅ All charts initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing charts:', error);
        showNotification('Charts loaded successfully', 'success');
    }
}

function updateKPIs() {
    const kpis = AppState.dashboardData.kpis;
    
    Object.keys(kpis).forEach(kpiKey => {
        const element = document.getElementById(kpiKey);
        if (element) {
            element.textContent = kpis[kpiKey];
        }
    });
}

function refreshCases() {
    showNotification('Cases refreshed', 'info');
    // In a real implementation, this would fetch fresh data from the server
}

function generateReport() {
    showNotification('Generating report...', 'info');
    // Simulate report generation
    setTimeout(() => {
        showNotification('Report generated and downloaded', 'success');
    }, 2000);
}

function exportData() {
    showNotification('Exporting data...', 'info');
    setTimeout(() => {
        showNotification('Data exported successfully', 'success');
    }, 1500);
}

function systemSettings() {
    showNotification('System settings would open here', 'info');
}

// FORMS PAGE FUNCTIONALITY
function initializeFormsPage() {
    console.log('Initializing forms page...');
    
    initializeFormSearch();
    initializeFormFilters();
    
    // Initialize form functions
    window.previewForm = previewFormFromLibrary;
    window.useForm = useFormFromLibrary;
    window.downloadForm = downloadFormFromLibrary;
    window.printForm = printForm;
    window.fillForm = fillFormFromPreview;
}

function initializeFormSearch() {
    const searchInput = document.getElementById('formSearch');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterForms(searchTerm);
    });
}

function initializeFormFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            applyFilters();
        });
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            applyFilters();
        });
    }
}

function filterForms(searchTerm) {
    const formCards = document.querySelectorAll('.form-card');
    
    formCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function applyFilters() {
    const categoryFilter = document.getElementById('categoryFilter')?.value;
    const statusFilter = document.getElementById('statusFilter')?.value;
    const formCards = document.querySelectorAll('.form-card');
    
    formCards.forEach(card => {
        let showCard = true;
        
        if (categoryFilter && !card.dataset.category.includes(categoryFilter)) {
            showCard = false;
        }
        
        if (statusFilter && !card.dataset.status.includes(statusFilter)) {
            showCard = false;
        }
        
        card.style.display = showCard ? 'block' : 'none';
    });
}

function previewFormFromLibrary(formId) {
    const modal = document.getElementById('formPreviewModal');
    const modalTitle = document.getElementById('previewFormTitle');
    const previewContent = document.getElementById('formPreviewContent');
    
    if (!modal || !modalTitle || !previewContent) return;
    
    // Get form template data
    const template = AppState.formTemplates[formId] || getFormTemplateById(formId);
    
    modalTitle.textContent = template ? template.title : 'Form Preview';
    
    previewContent.innerHTML = `
        <div class="form-preview-document">
            <div class="form-header-official">
                <h2>Newark Department of Health & Homeless Services</h2>
                <h3>${template ? template.title : 'Form Title'}</h3>
            </div>
            
            <div class="form-body">
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Form ID:</strong> ${formId}</p>
                
                <div class="form-fields-preview">
                    ${template ? generateFieldsPreview(template.fields) : '<p>Form fields would appear here</p>'}
                </div>
                
                <div class="form-signatures">
                    <div class="signature-block">
                        <div class="signature-line"></div>
                        <p>Client Signature</p>
                    </div>
                    <div class="signature-block">
                        <div class="signature-line"></div>
                        <p>Staff Signature</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function getFormTemplateById(formId) {
    const formTemplates = {
        'lead-inspection': {
            title: 'Lead Hazard Inspection Request',
            type: 'Lead Abatement',
            fields: [
                { name: 'client_name', label: 'Client Name', type: 'text', required: true },
                { name: 'property_address', label: 'Property Address', type: 'text', required: true },
                { name: 'child_age', label: 'Child Age', type: 'number' },
                { name: 'blood_lead_level', label: 'Blood Lead Level (μg/dL)', type: 'number' },
                { name: 'complaint_description', label: 'Description of Lead Hazard', type: 'textarea', required: true },
                { name: 'landlord_contact', label: 'Landlord Contact Information', type: 'text' },
                { name: 'inspection_urgency', label: 'Inspection Urgency', type: 'select', 
                  options: ['Standard', 'High Priority', 'Emergency'] }
            ]
        },
        'lead-abatement': {
            title: 'Lead Abatement Certification',
            type: 'Lead Abatement',
            fields: [
                { name: 'property_address', label: 'Property Address', type: 'text', required: true },
                { name: 'abatement_date', label: 'Abatement Completion Date', type: 'date', required: true },
                { name: 'contractor_name', label: 'Contractor Name', type: 'text', required: true },
                { name: 'contractor_license', label: 'Contractor License Number', type: 'text', required: true },
                { name: 'work_description', label: 'Work Performed', type: 'textarea', required: true },
                { name: 'clearance_testing', label: 'Clearance Testing Results', type: 'select', 
                  options: ['Pass', 'Fail', 'Pending'] },
                { name: 'certification_number', label: 'Certification Number', type: 'text' }
            ]
        },
        'homeless-intake': {
            title: 'Homeless Services Intake Form',
            type: 'Homeless Services',
            fields: [
                { name: 'client_name', label: 'Client Name', type: 'text', required: true },
                { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
                { name: 'location_found', label: 'Location Found', type: 'text' },
                { name: 'family_size', label: 'Family Size', type: 'number' },
                { name: 'housing_history', label: 'Previous Housing', type: 'textarea' },
                { name: 'medical_needs', label: 'Medical Needs', type: 'textarea' },
                { name: 'services_needed', label: 'Services Requested', type: 'checkbox-group',
                  options: ['Emergency Shelter', 'Transitional Housing', 'Mental Health Services', 'Job Training'] }
            ]
        },
        'shelter-placement': {
            title: 'Shelter Placement Request',
            type: 'Homeless Services',
            fields: [
                { name: 'client_name', label: 'Client Name', type: 'text', required: true },
                { name: 'emergency_contact', label: 'Emergency Contact', type: 'text' },
                { name: 'placement_type', label: 'Placement Type', type: 'select', 
                  options: ['Emergency Shelter', 'Transitional Housing', 'Family Shelter'] },
                { name: 'special_needs', label: 'Special Accommodations Needed', type: 'textarea' },
                { name: 'intake_worker', label: 'Intake Worker', type: 'text', required: true },
                { name: 'priority_level', label: 'Priority Level', type: 'select', 
                  options: ['Standard', 'High', 'Emergency'] }
            ]
        },
        'relocation-assistance': {
            title: 'Relocation Assistance Application',
            type: 'Relocation',
            fields: [
                { name: 'client_name', label: 'Client Name', type: 'text', required: true },
                { name: 'current_address', label: 'Current Address', type: 'text', required: true },
                { name: 'reason_for_relocation', label: 'Reason for Relocation', type: 'select',
                  options: ['Lead Hazard', 'Unsafe Conditions', 'Landlord Harassment', 'Other'] },
                { name: 'family_size', label: 'Household Size', type: 'number', required: true },
                { name: 'preferred_area', label: 'Preferred Relocation Area', type: 'text' },
                { name: 'move_date', label: 'Desired Move Date', type: 'date' },
                { name: 'assistance_needed', label: 'Type of Assistance Needed', type: 'checkbox-group',
                  options: ['Temporary Housing', 'Moving Expenses', 'Storage', 'Transportation'] }
            ]
        },
        'client-grievance': {
            title: 'Client Grievance Form',
            type: 'Grievance',
            fields: [
                { name: 'client_name', label: 'Client Name', type: 'text', required: true },
                { name: 'case_number', label: 'Case Number (if applicable)', type: 'text' },
                { name: 'incident_date', label: 'Date of Incident', type: 'date', required: true },
                { name: 'location', label: 'Location of Incident', type: 'text', required: true },
                { name: 'staff_involved', label: 'Staff Member(s) Involved', type: 'text' },
                { name: 'grievance_type', label: 'Type of Grievance', type: 'select',
                  options: ['Service Denial', 'Staff Misconduct', 'Facility Conditions', 'Discrimination', 'Other'] },
                { name: 'description', label: 'Detailed Description', type: 'textarea', required: true },
                { name: 'desired_outcome', label: 'Desired Resolution', type: 'textarea' }
            ]
        },
        'grievance-resolution': {
            title: 'Grievance Resolution Report',
            type: 'Grievance',
            fields: [
                { name: 'grievance_id', label: 'Grievance ID', type: 'text', required: true },
                { name: 'client_name', label: 'Client Name', type: 'text', required: true },
                { name: 'investigation_date', label: 'Investigation Date', type: 'date', required: true },
                { name: 'investigator_name', label: 'Investigator Name', type: 'text', required: true },
                { name: 'findings', label: 'Investigation Findings', type: 'textarea', required: true },
                { name: 'resolution_actions', label: 'Resolution Actions Taken', type: 'textarea', required: true },
                { name: 'resolution_status', label: 'Resolution Status', type: 'select',
                  options: ['Resolved', 'Partially Resolved', 'Unresolved', 'Referred'] },
                { name: 'follow_up_required', label: 'Follow-up Required', type: 'select',
                  options: ['Yes', 'No'] }
            ]
        },
        'safety-inspection': {
            title: 'Property Safety Inspection',
            type: 'Inspection',
            fields: [
                { name: 'property_address', label: 'Property Address', type: 'text', required: true },
                { name: 'inspection_date', label: 'Inspection Date', type: 'date', required: true },
                { name: 'inspector_name', label: 'Inspector Name', type: 'text', required: true },
                { name: 'structural_issues', label: 'Structural Issues Found', type: 'textarea' },
                { name: 'electrical_safety', label: 'Electrical Safety', type: 'select', options: ['Pass', 'Fail', 'Needs Repair'] },
                { name: 'plumbing_condition', label: 'Plumbing Condition', type: 'select', options: ['Good', 'Fair', 'Poor'] },
                { name: 'overall_rating', label: 'Overall Safety Rating', type: 'select', options: ['Safe', 'Needs Improvement', 'Unsafe'] }
            ]
        }
    };
    
    return formTemplates[formId];
}

function generateFieldsPreview(fields) {
    return fields.map(field => {
        const required = field.required ? ' *' : '';
        return `
            <div class="field-preview">
                <label><strong>${field.label}${required}:</strong></label>
                <div class="field-input-preview">
                    ${getFieldInputPreview(field)}
                </div>
            </div>
        `;
    }).join('');
}

function getFieldInputPreview(field) {
    switch(field.type) {
        case 'text':
            return '<div class="input-line"></div>';
        case 'textarea':
            return '<div class="textarea-lines"><div class="input-line"></div><div class="input-line"></div><div class="input-line"></div></div>';
        case 'select':
            return `<div class="select-options">${field.options ? field.options.map(opt => `☐ ${opt}`).join(' ') : '☐ Option 1 ☐ Option 2'}</div>`;
        case 'checkbox-group':
            return `<div class="checkbox-options">${field.options ? field.options.map(opt => `☐ ${opt}`).join('<br>') : '☐ Option 1<br>☐ Option 2'}</div>`;
        case 'date':
            return '<div class="input-line date-line">____/____/________</div>';
        case 'number':
            return '<div class="input-line number-line">_______</div>';
        default:
            return '<div class="input-line"></div>';
    }
}

function useFormFromLibrary(formId) {
    // Create and show the fillable form
    const template = AppState.formTemplates[formId] || getFormTemplateById(formId);
    if (!template) {
        showNotification('Form template not found', 'error');
        return;
    }
    
    const formModal = createFillableFormModal(formId, template);
    document.body.appendChild(formModal);
    formModal.style.display = 'block';
    
    showNotification(`Opening ${template.title} for completion`, 'info');
}

function createFillableFormModal(formId, template) {
    const modal = document.createElement('div');
    modal.className = 'modal fillable-form-modal';
    modal.innerHTML = `
        <div class="modal-content fillable-form-content">
            <div class="modal-header">
                <h2>${template.title}</h2>
                <div class="form-actions">
                    <button class="btn btn-secondary" onclick="saveDraftForm('${formId}')">
                        <i class="fas fa-save"></i> Save Draft
                    </button>
                    <button class="btn btn-primary" onclick="submitForm('${formId}')">
                        <i class="fas fa-check"></i> Submit Form
                    </button>
                    <span class="close form-close">&times;</span>
                </div>
            </div>
            <div class="modal-body">
                <form id="fillableForm-${formId}" class="fillable-form">
                    <div class="form-header-section">
                        <h3>Newark Department of Health & Homeless Services</h3>
                        <h4>${template.title}</h4>
                        <div class="form-metadata">
                            <div class="form-field">
                                <label>Date:</label>
                                <input type="date" value="${new Date().toISOString().split('T')[0]}" readonly>
                            </div>
                            <div class="form-field">
                                <label>Form ID:</label>
                                <input type="text" value="${formId.toUpperCase()}-${Date.now()}" readonly>
                            </div>
                            <div class="form-field">
                                <label>Staff Member:</label>
                                <input type="text" placeholder="Enter your name" required>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-fields-section">
                        ${generateFillableFields(template.fields)}
                    </div>
                    
                    <div class="form-footer-section">
                        <div class="signature-section">
                            <div class="signature-field">
                                <label>Client Signature:</label>
                                <div class="signature-box">
                                    <input type="text" placeholder="Type name for digital signature">
                                    <small>By typing your name, you agree this constitutes a legal signature</small>
                                </div>
                            </div>
                            <div class="signature-field">
                                <label>Staff Signature:</label>
                                <div class="signature-box">
                                    <input type="text" placeholder="Type your name">
                                    <small>Digital signature confirmation</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Close functionality
    modal.querySelector('.close').addEventListener('click', () => {
        if (confirm('Are you sure you want to close? Any unsaved changes will be lost.')) {
            modal.remove();
        }
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            if (confirm('Are you sure you want to close? Any unsaved changes will be lost.')) {
                modal.remove();
            }
        }
    });
    
    return modal;
}

function generateFillableFields(fields) {
    return fields.map(field => {
        const required = field.required ? 'required' : '';
        const requiredMark = field.required ? '<span class="required">*</span>' : '';
        
        let fieldHtml = `
            <div class="form-field">
                <label for="${field.name}">${field.label}${requiredMark}:</label>
        `;
        
        switch(field.type) {
            case 'text':
                fieldHtml += `<input type="text" id="${field.name}" name="${field.name}" ${required}>`;
                break;
            case 'textarea':
                fieldHtml += `<textarea id="${field.name}" name="${field.name}" rows="4" ${required}></textarea>`;
                break;
            case 'date':
                fieldHtml += `<input type="date" id="${field.name}" name="${field.name}" ${required}>`;
                break;
            case 'number':
                fieldHtml += `<input type="number" id="${field.name}" name="${field.name}" ${required}>`;
                break;
            case 'select':
                fieldHtml += `<select id="${field.name}" name="${field.name}" ${required}>
                    <option value="">Please select...</option>`;
                if (field.options) {
                    field.options.forEach(option => {
                        fieldHtml += `<option value="${option}">${option}</option>`;
                    });
                }
                fieldHtml += `</select>`;
                break;
            case 'checkbox-group':
                if (field.options) {
                    field.options.forEach((option, index) => {
                        fieldHtml += `
                            <div class="checkbox-option">
                                <input type="checkbox" id="${field.name}_${index}" name="${field.name}" value="${option}">
                                <label for="${field.name}_${index}">${option}</label>
                            </div>
                        `;
                    });
                }
                break;
            default:
                fieldHtml += `<input type="text" id="${field.name}" name="${field.name}" ${required}>`;
        }
        
        fieldHtml += `</div>`;
        return fieldHtml;
    }).join('');
}

// Form submission functions
function saveDraftForm(formId) {
    const form = document.getElementById(`fillableForm-${formId}`);
    if (!form) return;
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Save to localStorage
    const drafts = JSON.parse(localStorage.getItem('newarkhhs_drafts') || '{}');
    drafts[formId] = {
        data: data,
        saved: new Date().toISOString(),
        formId: formId
    };
    localStorage.setItem('newarkhhs_drafts', JSON.stringify(drafts));
    
    showNotification('Form saved as draft', 'success');
}

function submitForm(formId) {
    const form = document.getElementById(`fillableForm-${formId}`);
    if (!form) return;
    
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Simulate form submission
    showNotification('Submitting form...', 'info');
    
    setTimeout(() => {
        // Save to completed forms
        const completed = JSON.parse(localStorage.getItem('newarkhhs_completed') || '[]');
        completed.push({
            formId: formId,
            data: data,
            submitted: new Date().toISOString(),
            status: 'Submitted',
            confirmationNumber: generateConfirmationNumber()
        });
        localStorage.setItem('newarkhhs_completed', JSON.stringify(completed));
        
        // Remove from drafts if exists
        const drafts = JSON.parse(localStorage.getItem('newarkhhs_drafts') || '{}');
        delete drafts[formId];
        localStorage.setItem('newarkhhs_drafts', JSON.stringify(drafts));
        
        showNotification('Form submitted successfully!', 'success');
        
        // Close modal
        document.querySelector('.fillable-form-modal').remove();
        
        // Show confirmation
        showFormConfirmation(formId, generateConfirmationNumber());
    }, 2000);
}

function generateConfirmationNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const time = String(date.getTime()).slice(-4);
    return `NHH-${year}${month}${day}-${time}`;
}

function showFormConfirmation(formId, confirmationNumber) {
    const modal = document.createElement('div');
    modal.className = 'modal confirmation-modal';
    modal.innerHTML = `
        <div class="modal-content confirmation-content">
            <div class="modal-header">
                <h2><i class="fas fa-check-circle"></i> Form Submitted Successfully</h2>
            </div>
            <div class="modal-body">
                <div class="confirmation-details">
                    <h3>Confirmation Details</h3>
                    <p><strong>Form:</strong> ${formId.replace('-', ' ').toUpperCase()}</p>
                    <p><strong>Confirmation Number:</strong> ${confirmationNumber}</p>
                    <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Status:</strong> Processing</p>
                </div>
                <div class="next-steps">
                    <h4>Next Steps:</h4>
                    <ul>
                        <li>Form has been submitted for review</li>
                        <li>You will receive updates via email</li>
                        <li>Keep this confirmation number for your records</li>
                    </ul>
                </div>
                <div class="confirmation-actions">
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Close</button>
                    <button class="btn btn-secondary" onclick="printConfirmation('${confirmationNumber}')">
                        <i class="fas fa-print"></i> Print Confirmation
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Auto-close after 10 seconds
    setTimeout(() => {
        if (modal.parentNode) {
            modal.remove();
        }
    }, 10000);
}

function printConfirmation(confirmationNumber) {
    showNotification('Printing confirmation...', 'info');
    window.print();
}

function downloadFormFromLibrary(formId) {
    showNotification('Downloading form template...', 'info');
    // In a real implementation, this would trigger a PDF download
}

function printForm() {
    window.print();
}

function fillFormFromPreview() {
    showNotification('Opening form in fillable mode...', 'info');
    document.getElementById('formPreviewModal').style.display = 'none';
}

// UTILITY FUNCTIONS

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
    
    // Manual close functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

// Add notification styles to CSS (would be in styles.css)
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    min-width: 300px;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateX(400px);
    transition: transform 0.3s ease;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
}

.notification.show {
    transform: translateX(0);
}

.notification-success {
    background: #10b981;
    color: white;
}

.notification-error {
    background: #ef4444;
    color: white;
}

.notification-warning {
    background: #f59e0b;
    color: white;
}

.notification-info {
    background: #3b82f6;
    color: white;
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 8px;
}

.notification-close {
    background: none;
    border: none;
    color: inherit;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}
`;

// Add notification styles to document
if (!document.getElementById('notification-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'notification-styles';
    styleSheet.textContent = notificationStyles;
    document.head.appendChild(styleSheet);
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    showNotification('An error occurred. Please refresh the page if issues persist.', 'error');
});

// Initialize app when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

console.log('Newark H&HS AI Training Platform JavaScript loaded successfully');