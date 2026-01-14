// PRD Generator - Professional Interactive Application
// ================================================

// ================================
// State Management
// ================================
const state = {
    currentPhase: 'welcome', // welcome, interview, summary, generating, prd
    currentQuestionIndex: 0,
    answers: {
        productName: '',
        productType: '',
        description: '',
        targetAudience: ''
    },
    conversationHistory: []
};

// ================================
// Interview Questions
// ================================
const questions = [
    {
        key: 'productName',
        question: 'Qual é o nome do produto?',
        example: 'Exemplo: "TaskFlow", "MediConnect", "BudgetWise"',
        validator: (answer) => answer.trim().length > 0
    },
    {
        key: 'productType',
        question: 'Que tipo de produto é este?',
        example: 'Escolha exatamente uma opção: SaaS, Micro SaaS, Mobile App ou Website',
        validator: (answer) => {
            const normalized = answer.trim().toLowerCase();
            return ['saas', 'micro saas', 'mobile app', 'website'].includes(normalized);
        },
        normalizer: (answer) => {
            const normalized = answer.trim().toLowerCase();
            const typeMap = {
                'saas': 'SaaS',
                'micro saas': 'Micro SaaS',
                'mobile app': 'Mobile App',
                'website': 'Website'
            };
            return typeMap[normalized] || answer;
        }
    },
    {
        key: 'description',
        question: 'O que é o produto e que problema ele resolve? Qual é sua visão para ele?',
        example: 'Exemplo: "É uma plataforma de gestão de tarefas que ajuda equipes remotas a colaborar de forma mais eficiente. Nossa visão é eliminar a sobrecarga de informações e centralizar todo o trabalho em um só lugar."',
        validator: (answer) => answer.trim().length > 20
    },
    {
        key: 'targetAudience',
        question: 'Quem são os usuários principais? Quais são suas principais características, objetivos e pontos de dor?',
        example: 'Exemplo: "Gerentes de projeto em empresas de tecnologia de médio porte, que precisam coordenar equipes remotas e lutam com ferramentas fragmentadas e falta de visibilidade do progresso."',
        validator: (answer) => answer.trim().length > 20
    }
];

// ================================
// DOM Elements
// ================================
const elements = {
    welcomeScreen: document.getElementById('welcomeScreen'),
    interviewScreen: document.getElementById('interviewScreen'),
    prdScreen: document.getElementById('prdScreen'),
    startBtn: document.getElementById('startBtn'),
    sendBtn: document.getElementById('sendBtn'),
    userInput: document.getElementById('userInput'),
    chatContainer: document.getElementById('chatContainer'),
    stepperProgress: document.getElementById('stepperProgress'),
    prdContent: document.getElementById('prdContent'),
    copyBtn: document.getElementById('copyBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    newPrdBtn: document.getElementById('newPrdBtn'),
    resetBtn: document.getElementById('resetBtn'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    toastClose: document.getElementById('toastClose'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    modalOverlay: document.getElementById('modalOverlay'),
    modalTitle: document.getElementById('modalTitle'),
    modalMessage: document.getElementById('modalMessage'),
    modalClose: document.getElementById('modalClose'),
    modalCancel: document.getElementById('modalCancel'),
    modalConfirm: document.getElementById('modalConfirm')
};

// ================================
// Initialize Application
// ================================
function init() {
    // Event Listeners - Main Actions
    elements.startBtn.addEventListener('click', startInterview);
    elements.sendBtn.addEventListener('click', handleUserResponse);
    elements.userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserResponse();
        }
    });

    // PRD Actions
    elements.copyBtn.addEventListener('click', copyPRD);
    elements.downloadBtn.addEventListener('click', downloadPRD);
    elements.newPrdBtn.addEventListener('click', () => showResetModal());
    elements.resetBtn.addEventListener('click', () => showResetModal());

    // Toast
    elements.toastClose.addEventListener('click', hideToast);

    // Modal
    elements.modalClose.addEventListener('click', hideModal);
    elements.modalCancel.addEventListener('click', hideModal);
    elements.modalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.modalOverlay) hideModal();
    });

    // Auto-resize textarea
    elements.userInput.addEventListener('input', autoResizeTextarea);

    // Load saved state if exists
    loadStateFromStorage();
}

// ================================
// Screen Management
// ================================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    elements[screenId].classList.add('active');
}

// ================================
// Interview Flow
// ================================
function startInterview() {
    state.currentPhase = 'interview';
    showScreen('interviewScreen');
    elements.resetBtn.style.display = 'flex';

    // Add introduction message (Phase 1: Introduction)
    addMessage('assistant', `
        <p>Olá! Sou um <strong>Product Manager Sênior</strong> com mais de 10 anos de experiência especializado em escrever Product Requirements Documents (PRDs).</p>
        <p>Minha expertise abrange plataformas SaaS, soluções Micro SaaS, Aplicativos Mobile e Websites.</p>
        <p>Minha abordagem é caracterizada por:</p>
        <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
            <li>Clareza e precisão em especificações técnicas e funcionais</li>
            <li>Foco em viabilidade técnica e implementação realista</li>
            <li>Pensamento centrado no usuário que prioriza valor e experiência</li>
            <li>Raciocínio orientado por hipóteses, não opiniões infundadas</li>
        </ul>
        <p>Você está pronto para começar a definir seu produto?</p>
    `);

    setTimeout(() => {
        askNextQuestion();
    }, 1000);
}

function askNextQuestion() {
    if (state.currentQuestionIndex < questions.length) {
        const question = questions[state.currentQuestionIndex];
        updateStepper();

        addMessage('assistant', `
            <p><strong>${question.question}</strong></p>
            <p style="color: var(--color-gray-500); font-size: 0.875rem; margin-top: 0.5rem;">${question.example}</p>
        `);
    } else {
        showSummary();
    }
}

function handleUserResponse() {
    const userAnswer = elements.userInput.value.trim();

    if (!userAnswer) return;

    // Disable input while processing
    elements.userInput.disabled = true;
    elements.sendBtn.disabled = true;

    // Add user message to chat
    addMessage('user', `<p>${userAnswer}</p>`);
    elements.userInput.value = '';
    autoResizeTextarea();

    if (state.currentPhase === 'interview') {
        processInterviewAnswer(userAnswer);
    } else if (state.currentPhase === 'summary') {
        processSummaryResponse(userAnswer);
    }
}

function processInterviewAnswer(answer) {
    const question = questions[state.currentQuestionIndex];

    showTypingIndicator();

    setTimeout(() => {
        hideTypingIndicator();

        if (question.validator(answer)) {
            const normalizedAnswer = question.normalizer ? question.normalizer(answer) : answer;
            state.answers[question.key] = normalizedAnswer;

            addMessage('assistant', `<p>Perfeito! Anotado.</p>`);

            state.currentQuestionIndex++;
            saveStateToStorage();

            setTimeout(() => {
                askNextQuestion();
                enableInput();
            }, 800);
        } else {
            let errorMessage = '<p>Por favor, forneça uma resposta válida.</p>';

            if (question.key === 'productType') {
                errorMessage = `
                    <p>Por favor, escolha <strong>exatamente uma</strong> das seguintes opções:</p>
                    <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                        <li>SaaS</li>
                        <li>Micro SaaS</li>
                        <li>Mobile App</li>
                        <li>Website</li>
                    </ul>
                `;
            } else if (question.key === 'description' || question.key === 'targetAudience') {
                errorMessage = '<p>Por favor, forneça uma resposta mais detalhada (mínimo 20 caracteres).</p>';
            }

            addMessage('assistant', errorMessage);
            enableInput();
        }
    }, 1000);
}

function showSummary() {
    state.currentPhase = 'summary';
    updateStepper();

    const summaryHTML = `
        <p>Aqui está um resumo do que coletei:</p>
        <div style="background: var(--color-gray-100); border-left: 4px solid var(--color-primary-600); padding: 1.5rem; margin: 1rem 0; border-radius: 0.5rem;">
            <ul style="list-style: none; margin: 0; padding: 0;">
                <li style="padding: 0.5rem 0; border-bottom: 1px solid var(--color-gray-300);"><strong style="color: var(--color-primary-600);">Nome do Produto:</strong> ${state.answers.productName}</li>
                <li style="padding: 0.5rem 0; border-bottom: 1px solid var(--color-gray-300);"><strong style="color: var(--color-primary-600);">Tipo de Produto:</strong> ${state.answers.productType}</li>
                <li style="padding: 0.5rem 0; border-bottom: 1px solid var(--color-gray-300);"><strong style="color: var(--color-primary-600);">Descrição & Visão:</strong> ${state.answers.description}</li>
                <li style="padding: 0.5rem 0;"><strong style="color: var(--color-primary-600);">Público-Alvo:</strong> ${state.answers.targetAudience}</li>
            </ul>
        </div>
        <p>Isso está correto? Devo gerar o PRD abrangente agora, ou você gostaria de editar algo?</p>
        <p style="color: var(--color-gray-500); font-size: 0.875rem; margin-top: 0.5rem;">Digite "Sim", "Gerar" ou "Confirmar" para continuar, ou indique o que deseja editar.</p>
    `;

    addMessage('assistant', summaryHTML);
    enableInput();
}

function processSummaryResponse(answer) {
    const normalized = answer.trim().toLowerCase();

    elements.userInput.disabled = true;
    elements.sendBtn.disabled = true;

    showTypingIndicator();

    setTimeout(() => {
        hideTypingIndicator();

        if (normalized.includes('sim') || normalized.includes('gerar') || normalized.includes('confirmar') || normalized.includes('ok') || normalized.includes('yes')) {
            addMessage('assistant', '<p>Excelente! Vou gerar seu PRD abrangente agora. Isso pode levar alguns instantes...</p>');

            setTimeout(() => {
                generatePRD();
            }, 1000);
        } else {
            addMessage('assistant', `
                <p>Sem problema! O que você gostaria de editar?</p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>1. Nome do Produto</li>
                    <li>2. Tipo de Produto</li>
                    <li>3. Descrição & Visão</li>
                    <li>4. Público-Alvo</li>
                </ul>
                <p style="color: var(--color-gray-500); font-size: 0.875rem;">Digite o número ou nome do campo que deseja editar.</p>
            `);

            state.currentPhase = 'editing';
            enableInput();
        }
    }, 1000);
}

// ================================
// PRD Generation
// ================================
function generatePRD() {
    state.currentPhase = 'generating';
    showLoading();

    const prdMarkdown = buildPRD();
    const prdHTML = convertMarkdownToHTML(prdMarkdown);

    setTimeout(() => {
        hideLoading();
        state.currentPhase = 'prd';
        showScreen('prdScreen');
        elements.prdContent.innerHTML = prdHTML;
        saveStateToStorage();

        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast('PRD gerado com sucesso!');
    }, 2000);
}

function buildPRD() {
    const { productName, productType, description, targetAudience } = state.answers;

    let prd = `# DOCUMENTO DE REQUISITOS DE PRODUTO\n## ${productName}\n\n`;

    // 1. OVERVIEW & PROBLEM STATEMENT
    prd += `### 1. VISÃO GERAL & DECLARAÇÃO DO PROBLEMA\n\n`;
    prd += `**O Problema:**\n${description}\n\n`;
    prd += `**Por que isso importa:**\nHipótese: Este problema afeta diretamente ${targetAudience.toLowerCase()}, potencialmente impactando sua produtividade, eficiência e capacidade de alcançar seus objetivos.\n\n`;
    prd += `**Oportunidade:**\nHipótese: Existe uma oportunidade de criar valor ao resolver este problema através de ${productName}, fornecendo uma solução focada que endereça as necessidades identificadas.\n\n`;
    prd += `**Visão do Produto:**\nHipótese: ${productName} pode transformar a forma como os usuários abordam este desafio, oferecendo uma experiência integrada e centrada no usuário que reduz fricção e aumenta eficiência.\n\n`;

    // 2. PERSONAS & TARGET AUDIENCE
    prd += `### 2. PERSONAS & PÚBLICO-ALVO\n\n`;
    prd += `**Persona Primária: Usuário Principal**\n`;
    prd += `- **Papel/Título:** ${targetAudience}\n`;
    prd += `- **Objetivos:** Aumentar eficiência, reduzir fricção em processos atuais, obter melhores resultados\n`;
    prd += `- **Pontos de Dor:** Ferramentas fragmentadas, falta de integração, processos manuais demorados\n`;
    prd += `- **Contexto de Uso:** Uso diário como ferramenta principal de trabalho\n`;
    prd += `- **Comportamentos:** Hipótese: Usuários buscam soluções rápidas e intuitivas, evitam ferramentas com curva de aprendizado acentuada\n`;
    prd += `- **Necessidades:** Sistema confiável, interface clara, feedback imediato de ações\n\n`;

    prd += `**Persona Secundária: Tomador de Decisão**\n`;
    prd += `- **Papel/Título:** Líder de equipe ou gestor\n`;
    prd += `- **Objetivos:** Melhorar produtividade da equipe, obter visibilidade de progresso, tomar decisões informadas\n`;
    prd += `- **Pontos de Dor:** Falta de visibilidade, dificuldade em medir resultados, custos elevados de ferramentas atuais\n`;
    prd += `- **Contexto de Uso:** Revisão periódica e supervisão de equipe\n`;
    prd += `- **Comportamentos:** Hipótese: Tomadores de decisão priorizam dados consolidados e visão macro sobre detalhes operacionais\n`;
    prd += `- **Necessidades:** Relatórios claros, indicadores de progresso, capacidade de identificar gargalos\n\n`;

    // 3. MVP SCOPE
    prd += `### 3. ESCOPO DO MVP\n\n`;
    prd += `**No Escopo (In-Scope):**\n`;

    if (productType === 'Micro SaaS') {
        prd += `- **Funcionalidade Core Única:** A funcionalidade principal que entrega o maior valor ao usuário\n`;
        prd += `- Autenticação básica de usuários\n`;
        prd += `- Interface minimalista e focada no essencial\n`;
        prd += `- Operações básicas de criação, leitura, atualização e exclusão relacionadas à funcionalidade principal\n`;
        prd += `- Acesso via navegadores web em diferentes dispositivos\n\n`;
    } else if (productType === 'SaaS') {
        prd += `- Autenticação e autorização de usuários com diferentes níveis de acesso\n`;
        prd += `- Isolamento de dados entre diferentes organizações\n`;
        prd += `- Painel administrativo para gestão de usuários e configurações\n`;
        prd += `- Funcionalidades core do produto\n`;
        prd += `- Sistema de planos com diferentes níveis de acesso (gratuito e pagos)\n`;
        prd += `- Dashboard com métricas básicas de uso\n`;
        prd += `- Capacidade de integração com sistemas externos\n\n`;
    } else if (productType === 'Mobile App') {
        prd += `- Autenticação de usuários\n`;
        prd += `- Funcionalidades core acessíveis sem conexão à internet\n`;
        prd += `- Sincronização automática de dados quando conectado\n`;
        prd += `- Notificações para manter usuários informados\n`;
        prd += `- Aplicativo para dispositivos iOS e Android\n`;
        prd += `- Processo de onboarding guiado para novos usuários\n\n`;
    } else { // Website
        prd += `- Homepage otimizada para conversão de visitantes\n`;
        prd += `- Páginas institucionais essenciais (Sobre, Contato, etc.)\n`;
        prd += `- Sistema para gestão e publicação de conteúdo\n`;
        prd += `- Formulários para contato e cadastro de interessados\n`;
        prd += `- Experiência otimizada para diferentes tamanhos de tela\n`;
        prd += `- Otimização para mecanismos de busca\n\n`;
    }

    prd += `**Fora do Escopo (Out-of-Scope):**\n`;
    prd += `- Integrações avançadas com sistemas externos\n`;
    prd += `- Funcionalidades de relatórios complexos\n`;
    prd += `- Personalização avançada de interface\n`;
    prd += `- Suporte a múltiplos idiomas\n`;
    prd += `- Aplicativo móvel (se for Web) / Versão web (se for Mobile)\n\n`;

    prd += `**Premissas e Hipóteses:**\n`;
    prd += `- Hipótese: Usuários têm acesso adequado à internet para utilizar o produto (exceto funcionalidades offline específicas)\n`;
    prd += `- Hipótese: Usuários possuem dispositivos compatíveis com tecnologias web modernas\n`;
    prd += `- Hipótese: Usuários valorizarão simplicidade e foco sobre funcionalidades complexas no MVP\n`;
    prd += `- Hipótese: A funcionalidade core é suficiente para resolver o problema principal do público-alvo\n`;
    prd += `- Hipótese: Usuários estarão dispostos a experimentar uma solução nova se ela entregar valor imediato\n\n`;

    // 4. DETAILED FEATURES
    prd += `### 4. FUNCIONALIDADES DETALHADAS\n\n`;

    prd += buildFeatureSection('Autenticação de Usuários',
        'usuário',
        'fazer login no sistema',
        'poder acessar minhas informações e funcionalidades personalizadas',
        [
            'Dado que sou um usuário registrado, quando eu forneço credenciais válidas, então devo ser autenticado com sucesso',
            'Dado que forneço credenciais inválidas, quando tento fazer login, então devo ver uma mensagem de erro clara',
            'Dado que estou autenticado, quando fecho e reabro o aplicativo, então devo permanecer logado por 30 dias',
            'Dado que esqueci minha senha, quando solicito recuperação, então devo receber um email com instruções',
            'Dado que minha sessão expirou, quando tento acessar uma página protegida, então devo ser redirecionado para login'
        ],
        [
            'Tentativas múltiplas de login falhado devem bloquear temporariamente a conta',
            'Usuários sem verificação de email podem ter acesso limitado',
            'Tokens de sessão expirados devem ser tratados graciosamente'
        ]
    );

    prd += buildFeatureSection('Funcionalidade Principal',
        targetAudience.split(',')[0].trim(),
        'utilizar a funcionalidade core do produto',
        'resolver meu problema principal de forma eficiente',
        [
            'Dado que estou autenticado, quando acesso a funcionalidade principal, então devo ver uma interface clara e intuitiva',
            'Dado que realizo uma ação principal, quando confirmo, então o sistema deve processar em menos de 2 segundos',
            'Dado que cometo um erro, quando o sistema detecta, então devo receber feedback imediato e acionável',
            'Dado que tenho dados salvos, quando acesso o sistema, então devo ver meu histórico e estado anterior',
            'Dado que uso dispositivos diferentes, quando mudo de dispositivo, então meus dados devem estar sincronizados'
        ],
        [
            'Sistema deve funcionar com volume baixo de dados e alto volume de dados',
            'Perda de conexão durante operações críticas deve ser tratada com salvamento automático',
            'Dados corrompidos ou inválidos devem ser validados antes de processar'
        ]
    );

    if (productType === 'SaaS') {
        prd += buildFeatureSection('Gestão de Planos e Assinaturas',
            'administrador',
            'gerenciar planos e assinaturas',
            'controlar acesso a funcionalidades premium e monetizar o produto',
            [
                'Dado que sou um usuário free, quando tento acessar uma funcionalidade premium, então devo ver um paywall claro',
                'Dado que faço upgrade para um plano pago, quando o pagamento é confirmado, então devo ter acesso imediato às funcionalidades',
                'Dado que tenho uma assinatura ativa, quando ela está próxima do vencimento, então devo receber notificações',
                'Dado que cancelo minha assinatura, quando o período pago termina, então devo ser downgrade para plano free',
                'Dado que sou admin, quando acesso o painel, então devo ver métricas de conversão e churn'
            ],
            [
                'Falhas de pagamento devem ter retry automático e notificação ao usuário',
                'Mudanças de plano no meio do ciclo devem ter cálculo proporcional',
                'Usuários de trial devem ser convertidos automaticamente ao final'
            ]
        );
    }

    if (productType === 'Mobile App') {
        prd += buildFeatureSection('Sincronização e Modo Offline',
            'usuário móvel',
            'trabalhar offline e sincronizar quando houver conexão',
            'não perder dados e manter produtividade sem internet',
            [
                'Dado que perco conexão, quando realizo ações, então elas devem ser enfileiradas para sincronização posterior',
                'Dado que reconecto à internet, quando a conexão é restabelecida, então dados devem sincronizar automaticamente',
                'Dado que há conflito de dados, quando sincronizo, então devo poder escolher qual versão manter',
                'Dado que estou offline, quando tento acessar dados não baixados, então devo ver uma mensagem informativa',
                'Dado que sincronização está ocorrendo, quando visualizo o app, então devo ver um indicador de progresso'
            ],
            [
                'Sincronização deve priorizar dados mais recentes e críticos',
                'Bateria baixa deve pausar sincronização em background',
                'Dados grandes devem sincronizar apenas em WiFi, a menos que configurado diferente'
            ]
        );
    }

    if (productType === 'Website') {
        prd += buildFeatureSection('SEO e Performance',
            'visitante do site',
            'encontrar o site facilmente e ter uma experiência rápida',
            'acessar informações rapidamente e ter boa experiência de navegação',
            [
                'Dado que pesquiso no Google, quando procuro por palavras-chave relevantes, então o site deve aparecer nos primeiros resultados',
                'Dado que acesso qualquer página, quando carrega, então deve carregar em menos de 3 segundos',
                'Dado que uso dispositivo móvel, quando navego, então a experiência deve ser otimizada para touch',
                'Dado que acesso o site, quando a página carrega, então todos os Core Web Vitals devem estar em verde',
                'Dado que compartilho o site, quando a URL é colada, então deve mostrar preview rico (Open Graph)'
            ],
            [
                'Imagens devem ter lazy loading e WebP como formato alternativo',
                'Conexões lentas (3G) devem ainda ter experiência aceitável',
                'JavaScript desabilitado deve mostrar conteúdo básico'
            ]
        );
    }

    // 5. NON-FUNCTIONAL REQUIREMENTS
    prd += `### 5. REQUISITOS NÃO-FUNCIONAIS\n\n`;

    prd += `**Performance:**\n`;
    prd += `- O sistema deve responder a interações do usuário em menos de 200ms para 95% das requisições\n`;
    prd += `- Páginas devem carregar completamente em menos de 3 segundos em conexões 3G\n`;
    prd += `- O sistema deve suportar no mínimo 1.000 usuários simultâneos no MVP\n`;
    prd += `- Operações críticas devem fornecer feedback visual imediato ao usuário\n\n`;

    prd += `**Segurança:**\n`;
    prd += `- O sistema deve autenticar usuários de forma segura e manter sessões persistentes\n`;
    prd += `- Todas as comunicações devem ser criptografadas em trânsito\n`;
    prd += `- Credenciais de usuários devem ser armazenadas de forma segura e irreversível\n`;
    prd += `- O sistema deve limitar tentativas de acesso para prevenir abuso\n`;
    prd += `- O sistema deve proteger contra ataques comuns (injeção, cross-site scripting, etc.)\n`;
    prd += `- Dados sensíveis devem ter controles de acesso apropriados\n\n`;

    prd += `**Escalabilidade:**\n`;
    prd += `- O sistema deve ser capaz de escalar para suportar crescimento de usuários\n`;
    prd += `- Operações de leitura devem ser otimizadas para alto volume\n`;
    prd += `- Recursos estáticos devem ser entregues de forma eficiente globalmente\n`;
    prd += `- O sistema deve degradar graciosamente sob carga alta\n\n`;

    prd += `**Confiabilidade:**\n`;
    prd += `- O sistema deve ter disponibilidade mínima de 99.5% (objetivo)\n`;
    prd += `- Dados de usuários devem ser protegidos com backups regulares\n`;
    prd += `- Erros críticos devem ser detectados e reportados automaticamente\n`;
    prd += `- Falhas devem ser tratadas de forma transparente com mensagens claras ao usuário\n`;
    prd += `- O sistema deve se recuperar automaticamente de falhas temporárias quando possível\n\n`;

    prd += `**Compliance:**\n`;
    prd += `- O sistema deve permitir que usuários exerçam direitos de privacidade (acesso, exclusão, portabilidade)\n`;
    prd += `- Dados pessoais devem ser tratados de acordo com GDPR (Europa) e LGPD (Brasil)\n`;
    prd += `- Uma política de privacidade clara deve estar acessível aos usuários\n`;
    prd += `- Termos de serviço devem definir direitos e responsabilidades\n`;
    prd += `- Consentimento do usuário deve ser obtido para coleta de dados não essenciais\n\n`;

    prd += `**Acessibilidade:**\n`;
    prd += `- O sistema deve atender aos padrões WCAG 2.1 Level AA\n`;
    prd += `- Todas as funcionalidades devem ser acessíveis via teclado\n`;
    prd += `- Contraste de cores deve atender aos requisitos mínimos de legibilidade\n`;
    prd += `- Elementos não-textuais devem ter alternativas textuais apropriadas\n`;
    prd += `- O sistema deve ser compatível com tecnologias assistivas (leitores de tela)\n\n`;

    // 6. ANALYTICS & SUCCESS METRICS
    prd += `### 6. ANALYTICS & MÉTRICAS DE SUCESSO\n\n`;
    prd += `**Abordagem de Medição:**\n`;
    prd += `O produto deve ser instrumentado para coletar dados que validem ou refutem as hipóteses principais. As métricas abaixo representam sinais críticos de validação do produto.\n\n`;

    prd += `**Métrica 1: Ativação de Usuários**\n`;
    prd += `- **O que medir:** Percentual de usuários registrados que completam a ação principal do produto\n`;
    prd += `- **Como calcular:** (Usuários que completaram ação principal / Total de registros) × 100\n`;
    prd += `- **Hipótese a validar:** Usuários conseguem entender e extrair valor do produto rapidamente\n`;
    prd += `- **Eventos a instrumentar:** Registro de conta, primeiro login, conclusão de onboarding, execução da ação principal\n\n`;

    prd += `**Métrica 2: Retenção de Usuários**\n`;
    prd += `- **O que medir:** Percentual de usuários que retornam após 7 e 30 dias do primeiro uso\n`;
    prd += `- **Como calcular:** (Usuários ativos em D7 ou D30 / Novos usuários na coorte) × 100\n`;
    prd += `- **Hipótese a validar:** O produto oferece valor contínuo suficiente para criar hábito de uso\n`;
    prd += `- **Eventos a instrumentar:** Login diário, frequência de uso de funcionalidades core, tempo de sessão\n\n`;

    prd += `**Métrica 3: Satisfação do Usuário**\n`;
    prd += `- **O que medir:** Feedback qualitativo e quantitativo dos usuários sobre o produto\n`;
    prd += `- **Como calcular:** Score de satisfação (ex: escala 0-10) e análise de feedback aberto\n`;
    prd += `- **Hipótese a validar:** Usuários percebem o produto como solução adequada para seu problema\n`;
    prd += `- **Eventos a instrumentar:** Submissão de feedback, resposta a pesquisas, interações com suporte\n\n`;

    if (productType === 'SaaS' || productType === 'Micro SaaS') {
        prd += `**Métrica 4: Conversão para Planos Pagos**\n`;
        prd += `- **O que medir:** Percentual de usuários que convertem de plano gratuito para pago\n`;
        prd += `- **Como calcular:** (Upgrades para plano pago / Total de usuários em plano gratuito) × 100\n`;
        prd += `- **Hipótese a validar:** O valor oferecido justifica investimento financeiro dos usuários\n`;
        prd += `- **Eventos a instrumentar:** Visualização de paywall, início de checkout, conclusão de pagamento, cancelamentos\n\n`;

        prd += `**Métrica 5: Continuidade de Uso em Planos Pagos**\n`;
        prd += `- **O que medir:** Percentual de assinantes que mantêm suas assinaturas ativas\n`;
        prd += `- **Como calcular:** (Cancelamentos no período / Total de assinantes início do período) × 100\n`;
        prd += `- **Hipótese a validar:** Usuários pagantes continuam percebendo valor ao longo do tempo\n`;
        prd += `- **Eventos a instrumentar:** Renovações de assinatura, cancelamentos, downgrades, reativações\n\n`;
    }

    if (productType === 'Mobile App') {
        prd += `**Métrica 4: Uso de Funcionalidades Nativas**\n`;
        prd += `- **O que medir:** Frequência de uso de funcionalidades específicas de mobile (notificações, offline, etc.)\n`;
        prd += `- **Como calcular:** (Usuários que utilizam funcionalidade / Total de usuários ativos) × 100\n`;
        prd += `- **Hipótese a validar:** Funcionalidades nativas agregam valor diferenciado vs versão web\n`;
        prd += `- **Eventos a instrumentar:** Permissões concedidas, uso offline, interação com notificações push\n\n`;
    }

    if (productType === 'Website') {
        prd += `**Métrica 4: Conversão de Visitantes**\n`;
        prd += `- **O que medir:** Percentual de visitantes que completam ações-chave (cadastro, contato, etc.)\n`;
        prd += `- **Como calcular:** (Usuários que completaram ação / Total de visitantes únicos) × 100\n`;
        prd += `- **Hipótese a validar:** O conteúdo e proposta de valor são persuasivos para o público-alvo\n`;
        prd += `- **Eventos a instrumentar:** Pageviews, tempo na página, scroll depth, submissão de formulários\n\n`;
    }

    prd += `---\n\n`;
    prd += `**Documento gerado por PRD Generator**\n`;
    prd += `Data: ${new Date().toLocaleDateString('pt-BR')}\n`;
    prd += `Versão: 1.0 (MVP)\n`;

    return prd;
}

function buildFeatureSection(title, persona, action, benefit, acceptanceCriteria, edgeCases) {
    let section = `#### ${title}\n\n`;
    section += `**User Story:**\n`;
    section += `Como um ${persona}, eu quero ${action}, para que ${benefit}.\n\n`;
    section += `**Critérios de Aceitação:**\n`;
    acceptanceCriteria.forEach((criteria, index) => {
        section += `${index + 1}. ${criteria}\n`;
    });
    section += `\n`;
    section += `**Casos de Borda:**\n`;
    edgeCases.forEach((edge) => {
        section += `- ${edge}\n`;
    });
    section += `\n`;
    return section;
}

function convertMarkdownToHTML(markdown) {
    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

    // Lists
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>');

    // Wrap lists
    html = html.replace(/(<li>.*<\/li>)/gims, function(match) {
        return '<ul>' + match + '</ul>';
    });

    // Paragraphs
    html = html.split('\n\n').map(para => {
        if (para.startsWith('<h') || para.startsWith('<ul') || para.startsWith('<li')) {
            return para;
        }
        return para ? `<p>${para}</p>` : '';
    }).join('\n');

    // Horizontal rule
    html = html.replace(/^---$/gim, '<hr>');

    return html;
}

// ================================
// PRD Actions
// ================================
function copyPRD() {
    const prdText = elements.prdContent.innerText;
    navigator.clipboard.writeText(prdText).then(() => {
        showToast('PRD copiado para a área de transferência!');
    }).catch(() => {
        showToast('Erro ao copiar PRD', 'error');
    });
}

function downloadPRD() {
    const prdMarkdown = buildPRD();
    const blob = new Blob([prdMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PRD_${state.answers.productName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('PRD baixado com sucesso!');
}

// ================================
// UI Helper Functions
// ================================
function addMessage(type, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = type === 'assistant' ? 'AI' : 'Você';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = content;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);

    elements.chatContainer.appendChild(messageDiv);
    elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;

    // Reinitialize icons for new content
    if (window.lucide) {
        lucide.createIcons();
    }

    state.conversationHistory.push({ type, content });
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant';
    typingDiv.id = 'typingIndicator';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = 'AI';

    const indicator = document.createElement('div');
    indicator.className = 'message-content typing-indicator';
    indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

    typingDiv.appendChild(avatar);
    typingDiv.appendChild(indicator);
    elements.chatContainer.appendChild(typingDiv);
    elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

function enableInput() {
    elements.userInput.disabled = false;
    elements.sendBtn.disabled = false;
    elements.userInput.focus();
}

function updateStepper() {
    // Update progress bar
    const totalSteps = questions.length + 1; // +1 for summary
    const currentStep = state.currentQuestionIndex + 1;
    const progress = (currentStep / totalSteps) * 100;
    elements.stepperProgress.style.width = `${progress}%`;

    // Update step circles
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index < currentStep) {
            step.classList.add('completed');
        } else if (index === currentStep) {
            step.classList.add('active');
        }
    });

    // Reinitialize icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

function autoResizeTextarea() {
    const textarea = elements.userInput;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
}

// ================================
// Toast Notification
// ================================
function showToast(message, type = 'success') {
    elements.toastMessage.textContent = message;
    elements.toast.classList.add('show');

    // Reinitialize icons
    if (window.lucide) {
        lucide.createIcons();
    }

    setTimeout(() => {
        hideToast();
    }, 3000);
}

function hideToast() {
    elements.toast.classList.remove('show');
}

// ================================
// Loading Overlay
// ================================
function showLoading() {
    elements.loadingOverlay.classList.add('show');
}

function hideLoading() {
    elements.loadingOverlay.classList.remove('show');
}

// ================================
// Modal
// ================================
function showResetModal() {
    elements.modalTitle.textContent = 'Confirmar Nova Sessão';
    elements.modalMessage.textContent = 'Tem certeza que deseja iniciar uma nova sessão? Todo o progresso atual será perdido.';

    elements.modalOverlay.classList.add('show');

    // Set confirm action
    elements.modalConfirm.onclick = () => {
        hideModal();
        resetApp();
    };

    // Reinitialize icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

function hideModal() {
    elements.modalOverlay.classList.remove('show');
    elements.modalConfirm.onclick = null;
}

// ================================
// Reset & Storage
// ================================
function resetApp() {
    // Clear state
    state.currentPhase = 'welcome';
    state.currentQuestionIndex = 0;
    state.answers = {
        productName: '',
        productType: '',
        description: '',
        targetAudience: ''
    };
    state.conversationHistory = [];

    // Clear UI
    elements.chatContainer.innerHTML = '';
    elements.prdContent.innerHTML = '';
    elements.userInput.value = '';

    // Reset stepper
    elements.stepperProgress.style.width = '0%';
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index === 0) step.classList.add('active');
    });

    // Show welcome screen
    showScreen('welcomeScreen');
    elements.resetBtn.style.display = 'none';

    // Clear storage
    localStorage.removeItem('prdGeneratorState');

    // Reinitialize icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

function saveStateToStorage() {
    try {
        localStorage.setItem('prdGeneratorState', JSON.stringify(state));
    } catch (e) {
        console.error('Failed to save state:', e);
    }
}

function loadStateFromStorage() {
    try {
        const saved = localStorage.getItem('prdGeneratorState');
        if (saved) {
            const savedState = JSON.parse(saved);
            Object.assign(state, savedState);

            if (state.currentPhase !== 'welcome') {
                elements.resetBtn.style.display = 'flex';
            }

            if (state.currentPhase === 'interview' || state.currentPhase === 'summary') {
                showScreen('interviewScreen');
                state.conversationHistory.forEach(msg => {
                    addMessage(msg.type, msg.content);
                });
                updateStepper();
                enableInput();
            } else if (state.currentPhase === 'prd') {
                showScreen('prdScreen');
                const prdMarkdown = buildPRD();
                const prdHTML = convertMarkdownToHTML(prdMarkdown);
                elements.prdContent.innerHTML = prdHTML;
            }
        }
    } catch (e) {
        console.error('Failed to load state:', e);
    }
}

// ================================
// Initialize on DOM Ready
// ================================
document.addEventListener('DOMContentLoaded', init);
